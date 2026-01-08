from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, date
import mysql.connector
import time
import re
import requests


# ===============================================================
#                 DATABASE CONNECTION & SETUP
# ===============================================================
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="pass123",
        database="skillbridge",
        autocommit=False
    )
    cursor = conn.cursor()
    print("✓ Database connection successful.")
except mysql.connector.Error as err:
    print(f"✗ Database Connection Error: {err}")
    exit(1)

# ===============================================================
#                 HELPER FUNCTIONS
# ===============================================================
def slugify(title: str) -> str:
    if not title:
        return "na"
    return re.sub(r'[^a-z0-9-]', '', title.lower().replace(" ", "-"))

def clean_text(val):
    """Return normalized string or empty string."""
    if val is None:
        return ""
    s = str(val).replace("\u00A0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def predict_years(eligibility):
    eligibility = (eligibility or "").lower()
    if any(w in eligibility for w in ["1st", "first"]): return [1]
    if any(w in eligibility for w in ["2nd", "second"]): return [2]
    if any(w in eligibility for w in ["3rd", "third", "pre-final"]): return [3]
    if any(w in eligibility for w in ["4th", "fourth", "final", "fresher"]): return [4]
    if any(w in eligibility for w in ["undergraduate", "engineering", "any", "all", "everyone"]):
        return [1, 2, 3, 4]
    open_phrases = ["anyone can apply", "open to all", "career can also apply"]
    if any(p in eligibility for p in open_phrases): return [1, 2, 3, 4]
    return []

def parse_deadline(soup):
    """
    Extracts application deadline from Unstop page content.
    """
    try:
        # 1️⃣ Unstop-specific apptranslate attributes
        for attr_value in ["dates.registrationDeadline", "dates.applicationDeadline"]:
            span_tag = soup.find("span", attrs={"apptranslate": attr_value})
            if span_tag:
                strong_tag = span_tag.find_next("strong")
                if strong_tag:
                    date_text = clean_text(strong_tag.get_text(strip=True))
                    if re.search(r"(Starts|Opens|Begins)", date_text, re.I): 
                        continue
                    date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
                    if date_match:
                        date_str = date_match.group(1)
                        for fmt in ("%d %b %y", "%d %b %Y"):
                            try:
                                return datetime.strptime(date_str, fmt).date()
                            except ValueError: 
                                continue

        # 2️⃣ Generic fallback (text matching)
        deadline_label = soup.find(
            ["span", "div", "label", "p"],
            string=re.compile(r"(Application Deadline|Registration Deadline|Deadline|Apply By|Last date)", re.I),
        )
        if deadline_label:
            date_tag = deadline_label.find_next(["strong", "b", "time", "span"])
            if date_tag:
                date_text = clean_text(date_tag.get_text(" ", strip=True))
                if re.search(r"(Starts|Opens|Begins)", date_text, re.I): 
                    return None
                date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
                if date_match:
                    date_str = date_match.group(1)
                    for fmt in ("%d %b %y", "%d %b %Y"):
                        try:
                            return datetime.strptime(date_str, fmt).date()
                        except ValueError: 
                            continue

        # 3️⃣ Page-wide fallback (regex search)
        full_text = soup.get_text(" ", strip=True)
        date_match = re.search(
            r"(?:Application Deadline|Registration Deadline|Apply By|Last date)[:\s-]*(\d{1,2}\s+\w{3}\s+\d{2,4})",
            full_text,
            re.IGNORECASE,
        )
        if date_match:
            date_str = date_match.group(1)
            for fmt in ("%d %b %y", "%d %b %Y"):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError: 
                    continue

    except Exception as e:
        print(f"Error parsing deadline: {e}")

    return None


def extract_unstop_requirements(soup):
    """Extract skills and requirements from page"""
    content_divs = soup.find_all("div", class_=re.compile("un_editor_text_live|competitionDetails|desc", re.I))
    full_text = " ".join(div.get_text(" ", strip=True) for div in content_divs)
    requirements = []

    # Attempt 1: Find bulleted lists under headers
    possible_headers = soup.find_all(
        ["strong", "b", "p", "h3", "h4"],
        string=re.compile(r"(requirement|eligibility|qualification|who can apply|skills required)", re.I),
    )
    for header in possible_headers:
        ul = header.find_next(["ul", "ol"])
        if ul:
            requirements = [li.get_text(strip=True) for li in ul.find_all("li")]
            if requirements: 
                break

    if not requirements:
        # Attempt 2: Regex search in full text
        match = re.search(
            r"(?:Requirements|Eligibility|Qualifications|Who can apply)[:\-–]?\s*(.*?)(?:Responsibilities|Duration|About|Perks|Location|Stipend|$)",
            full_text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            text_block = match.group(1)
            items = re.split(r"[•\-\n;]", text_block)
            requirements = [i.strip() for i in items if len(i.strip()) > 5]

    requirements = [re.sub(r"\s+", " ", r) for r in requirements]
    return ", ".join(requirements[:5]) if requirements else "Not specified"


def parse_stipend(soup):
    """
    Improved stipend extraction with multiple fallback methods.
    Returns stipend amount as string, or None if not found.
    """
    try:
        # Method 1: Look for Stipend header and extract from nearby text
        stipend_headers = soup.find_all(["h3", "h4", "h5", "strong", "b", "span"], 
                                       string=re.compile(r"stipend|salary|monthly|monthly\s+stipend", re.I))
        
        for header in stipend_headers:
            # Get parent container
            container = header.find_parent(["div", "p", "section"])
            if container:
                text = container.get_text(" ", strip=True).lower()
                
                # Check for unpaid
                if "unpaid" in text or "no stipend" in text or "no salary" in text:
                    return "Unpaid"
                
                # Extract all numbers
                amounts = re.findall(r'₹?\s*([0-9,]+(?:\.[0-9]{2})?)', text)
                if amounts:
                    # Convert to integers and return minimum
                    values = []
                    for amt in amounts:
                        try:
                            values.append(int(amt.replace(",", "").split(".")[0]))
                        except:
                            continue
                    if values:
                        return str(min(values))
        
        # Method 2: Search for common stipend patterns in full page text
        full_text = soup.get_text(" ", strip=True)
        
        # Pattern: "Stipend: ₹X,XXX" or "Monthly Stipend: ₹X,XXX"
        pattern = r"(?:stipend|salary)[:\s-]*(?:upto|up to|₹|rs\.?\s*)?([0-9,]+(?:\.[0-9]{2})?)"
        matches = re.finditer(pattern, full_text, re.IGNORECASE)
        
        amounts = []
        for match in matches:
            try:
                amount = int(match.group(1).replace(",", "").split(".")[0])
                amounts.append(amount)
            except:
                continue
        
        if amounts:
            return str(min(amounts))
        
        # Method 3: Check for range patterns like "₹10,000 - ₹15,000"
        range_pattern = r'₹?\s*([0-9,]+)\s*(?:-|to)\s*₹?\s*([0-9,]+)'
        range_match = re.search(range_pattern, full_text)
        if range_match:
            try:
                min_amt = int(range_match.group(1).replace(",", ""))
                max_amt = int(range_match.group(2).replace(",", ""))
                return str(min(min_amt, max_amt))
            except:
                pass
        
        # Method 4: Look for "Unpaid" or "No Stipend" text anywhere
        if re.search(r"\bunpaid\b|\bno\s+stipend\b|\bno\s+salary\b", full_text, re.IGNORECASE):
            return "Unpaid"
            
    except Exception as e:
        print(f"Error parsing stipend: {e}")

    return None


def normalize_stipend(stipend_text):
    """Convert stipend text to integer value. Return 0 if unpaid or not mentioned."""
    if not stipend_text:
        return 0

    text = stipend_text.lower().strip()

    # Unpaid / Not mentioned cases
    if text in ["unpaid", "not specified", "no stipend", "none", "-", ""]:
        return 0

    # Extract all numbers
    matches = re.findall(r"([0-9,]+)", text)
    if matches:
        try:
            values = [int(x.replace(",", "")) for x in matches]
            return min(values)  # return the minimum value
        except:
            pass
    
    return 0


# ===============================================================
#                 SELENIUM DRIVER SETUP
# ===============================================================
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--log-level=3")
chrome_options.add_argument("--headless=new")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'}

# ===============================================================
#                     PAGINATION LOOP
# ===============================================================
print("Starting pagination scraping (5 pages)...")

base_url = "https://unstop.com/internships?search=computer%20science"
MAX_PAGES_TO_FETCH = 5
all_card_urls = []

for page_num in range(1, MAX_PAGES_TO_FETCH + 1):
    try:
        page_url = f"{base_url}&page={page_num}"
        print(f"\n-- Loading page {page_num}: {page_url}")
        driver.get(page_url)
        time.sleep(3)

        page_soup = BeautifulSoup(driver.page_source, "html.parser")

        # Collect hrefs from common card selectors
        hrefs = []
        for a in page_soup.select('a.item'):
            href = a.get('href')
            if href:
                if href.startswith('/'):
                    href = 'https://unstop.com' + href
                hrefs.append(href)

        # Fallback selectors if none found
        if not hrefs:
            for a in page_soup.select('a[href*="/internships/"]'):
                href = a.get('href')
                if href and '/internships/' in href:
                    if href.startswith('/'):
                        href = 'https://unstop.com' + href
                    hrefs.append(href)

        # Deduplicate while preserving order
        seen = set()
        for h in hrefs:
            if h not in seen:
                seen.add(h)
                all_card_urls.append(h)

        print(f"Found {len(hrefs)} card hrefs on page {page_num}. Total collected: {len(all_card_urls)}")

    except Exception as e:
        print(f"Error loading/parsing page {page_num}: {e}")
        continue

# Prepare requests session
session = requests.Session()
session.headers.update({'User-Agent': HEADERS['User-Agent'], 'Accept-Language': 'en-US,en;q=0.9'})

try:
    selenium_cookies = driver.get_cookies()
    for ck in selenium_cookies:
        session.cookies.set(ck.get('name'), ck.get('value'), domain=ck.get('domain'))
    print(f"✓ Transferred {len(selenium_cookies)} cookies from Selenium to requests session")
except Exception as e:
    print(f"Could not transfer cookies: {e}")

def try_accept_cookies(driver):
    """Try to accept cookie banners"""
    try:
        buttons = driver.find_elements(By.XPATH, "//button|//a")
        for b in buttons:
            try:
                txt = b.text or ''
                if 'accept' in txt.lower() or 'cookie' in txt.lower() or 'agree' in txt.lower():
                    b.click()
                    time.sleep(1)
                    return True
            except Exception:
                continue
    except Exception:
        return False
    return False


# ===============================================================
#                 MAIN SCRAPING LOOP
# ===============================================================
print(f"\nTotal internships to process: {len(all_card_urls)}\n")

for idx, internship_url in enumerate(all_card_urls, start=1):
    try:
        print(f"\nProcessing #{idx}: {internship_url}")
        
        # Fetch detail page via requests (faster)
        try:
            resp = session.get(internship_url, timeout=15)
            if resp.status_code != 200:
                print(f"  Detail page returned status {resp.status_code}, skipping")
                continue
            
            text = resp.text
            if 'Cookies Disabled' in text or 'enable cookies' in text.lower():
                print('  Cookies issue detected; falling back to Selenium')
                try_accept_cookies(driver)
                driver.get(internship_url)
                time.sleep(2)
                soup = BeautifulSoup(driver.page_source, "html.parser")
            else:
                soup = BeautifulSoup(text, "html.parser")
        except Exception as e:
            print(f"  Failed to fetch via requests: {e}. Falling back to Selenium")
            driver.get(internship_url)
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, "html.parser")

        # --- 1. Extract title/company ---
        title = "N/A"
        company = "N/A"
        company_url = None

        t = soup.find(['h1', 'h2'], class_=re.compile('title|heading|double-wrap', re.I)) or soup.find('h1') or soup.find('h2')
        if t:
            title = clean_text(t.get_text())
        else:
            og = soup.find('meta', property='og:title')
            if og and og.get('content'):
                title = clean_text(og.get('content'))

        c = soup.find(class_=re.compile('company-name|company|org|employer', re.I))
        if c:
            company = clean_text(c.get_text())
            a_tag = c.find('a')
            if a_tag and a_tag.get('href'):
                company_url = a_tag.get('href')
                if company_url.startswith('/'):
                    company_url = 'https://unstop.com' + company_url
        else:
            comp_link = soup.select_one('a[href*="/companies/"]')
            if comp_link:
                company = clean_text(comp_link.get_text())
                company_url = comp_link.get('href')
                if company_url and company_url.startswith('/'):
                    company_url = 'https://unstop.com' + company_url

        if not title or title == "N/A":
            print(f"Skipping #{idx}: could not determine title from page.")
            continue

        # --- 2. Check for existence ---
        cursor.execute("SELECT id FROM internships WHERE link = %s", (internship_url,))
        existing_results = cursor.fetchall()
        if existing_results:
            print(f"Skipping existing internship: {title} ({company})")
            continue

        # --- 3. Extract detail data ---
        deadline_date = parse_deadline(soup)

        if deadline_date is None:
            deadline_date = datetime.now().date() + timedelta(days=30)
            print(f"  * Deadline not found, setting to default: {deadline_date.isoformat()}")

        if deadline_date < date.today():
            print(f"  ✗ Skipping expired internship: {title} ({company}) — deadline {deadline_date}")
            continue

        # ✓ IMPROVED SALARY EXTRACTION
        stipend_raw = parse_stipend(soup) or "Not specified"
        stipend = normalize_stipend(stipend_raw)
        
        eligibility_text = "Not specified"
        eligibility_section = soup.find("div", class_="eligibility_sect")
        if eligibility_section:
            eligi_divs = eligibility_section.find_all("div", class_="eligi")
            eligibility_list = [clean_text(div.get_text(strip=True)) for div in eligi_divs if clean_text(div.get_text(strip=True))]
            eligibility_text = ", ".join(eligibility_list) if eligibility_list else eligibility_text

        predicted_years = predict_years(eligibility_text)
        skills_str = extract_unstop_requirements(soup)
        deadline_db = deadline_date.isoformat() if isinstance(deadline_date, date) else None

        # --- 4. Insert new record ---
        for yr in predicted_years or [0]:
            try:
                cursor.execute("""
                    INSERT INTO internships (title, company, company_url, link, eligibility, year, skills, source, deadline, stipend, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (title, company, company_url, internship_url, eligibility_text, str(yr), skills_str, "unstop", deadline_db, stipend))
                conn.commit()
                print(f"✓ Added: {title} ({company}) | Year {yr} | Stipend: ₹{stipend if stipend > 0 else 'Unpaid'}")
            except Exception as e:
                conn.rollback()
                print(f"DB insert error for {internship_url} (Year {yr}): {e}")

        print(f"  Deadline: {deadline_db} | Eligibility: {eligibility_text}")
        print("-" * 100)

    except Exception as e:
        print(f"Error scraping internship #{idx} ({internship_url}): {e}")


# ===============================================================
#                 CLEANUP FUNCTION
# ===============================================================
def delete_expired_internships():
    """Delete internships with past deadlines"""
    today = datetime.now().date()
    cursor.execute("SELECT id, title, deadline FROM internships WHERE deadline IS NOT NULL AND deadline < %s", (today.isoformat(),))
    expired = cursor.fetchall()
    for eid, etitle, edead in expired:
        print(f"Deleting expired: id={eid}, title={etitle}, deadline={edead}")
        
    cursor.execute("DELETE FROM internships WHERE deadline IS NOT NULL AND deadline < %s", (today.isoformat(),))
    deleted = cursor.rowcount
    conn.commit()
    print(f"✓ Deleted {deleted} expired internships.")


# Run cleanup and close connections
delete_expired_internships()
driver.quit()
cursor.close()
conn.close()
print("\n✓ All internships scraped, cleaned, and connections closed successfully.")
