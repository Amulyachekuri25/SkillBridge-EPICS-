from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, date
import mysql.connector
import time
import re
import requests

# ===============================================================
#                 DATABASE CONNECTION
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
def clean_text(val):
    """Return normalized string or empty string."""
    if val is None:
        return ""
    s = str(val).replace("\u00A0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def predict_years(eligibility):
    """Predict which years are eligible based on eligibility text"""
    eligibility = (eligibility or "").lower()
    if any(w in eligibility for w in ["1st", "first"]): return [1]
    if any(w in eligibility for w in ["2nd", "second"]): return [2]
    if any(w in eligibility for w in ["3rd", "third", "pre-final"]): return [3]
    if any(w in eligibility for w in ["4th", "fourth", "final", "fresher"]): return [4]
    if any(w in eligibility for w in ["undergraduate", "engineering", "any", "all", "everyone"]):
        return [1, 2, 3, 4]
    open_phrases = ["anyone can apply", "open to all"]
    if any(p in eligibility for p in open_phrases): return [1, 2, 3, 4]
    return []

def parse_deadline(soup):
    """Extract application deadline from Unstop page"""
    try:
        # Method 1: Look for appDeadline attribute (most specific)
        deadline_span = soup.find("span", attrs={"apptranslate": "appDeadline"})
        if deadline_span:
            strong_tag = deadline_span.find_next("strong")
            if strong_tag:
                date_text = clean_text(strong_tag.get_text(strip=True))
                # Extract date part (21 Dec 25, 06:52 AM IST -> 21 Dec 25)
                date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
                if date_match:
                    date_str = date_match.group(1)
                    for fmt in ("%d %b %y", "%d %b %Y"):
                        try:
                            return datetime.strptime(date_str, fmt).date()
                        except ValueError: 
                            continue
        
        # Method 2: Unstop-specific apptranslate attributes (dates.registrationDeadline, dates.applicationDeadline)
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

        # Method 3: Generic fallback text matching
        deadline_label = soup.find(
            ["span", "div", "label", "p"],
            string=re.compile(r"(Application Deadline|Registration Deadline|Deadline|Apply By|Last date)", re.I),
        )
        if deadline_label:
            date_tag = deadline_label.find_next(["strong", "b", "time", "span"])
            if date_tag:
                date_text = clean_text(date_tag.get_text(" ", strip=True))
                date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
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
    """Extract skills and requirements comprehensively"""
    requirements = []
    
    # Method 1: Look for "Requirements:" section in details area
    content_divs = soup.find_all("div", class_="un_editor_text_live")
    for div in content_divs:
        # Find all strong tags to locate "Requirements:" section
        strong_tags = div.find_all("strong")
        for strong in strong_tags:
            if "requirement" in strong.get_text(strip=True).lower():
                # Get the next ul/ol after the "Requirements:" strong tag
                ul = strong.find_next(["ul", "ol"])
                if ul:
                    items = [li.get_text(strip=True) for li in ul.find_all("li")]
                    if items:
                        requirements.extend(items)
                        break
        if requirements:
            break
    
    # Method 2: Find bulleted lists under headers (if not found in Method 1)
    if not requirements:
        possible_headers = soup.find_all(
            ["strong", "b", "p", "h3", "h4", "span"],
            string=re.compile(r"(requirement|skills|qualification|who can apply|tech stack)", re.I),
        )
        for header in possible_headers:
            ul = header.find_next(["ul", "ol"])
            if ul:
                items = [li.get_text(strip=True) for li in ul.find_all("li")]
                if items:
                    requirements.extend(items)
                    break
    
    # Method 3: Extract from structured divs with class matching
    if not requirements:
        content_divs = soup.find_all("div", class_=re.compile("un_editor_text_live|requirements|desc|skills", re.I))
        for div in content_divs:
            lis = div.find_all("li")
            if lis:
                items = [li.get_text(strip=True) for li in lis]
                requirements.extend(items)
                if requirements:
                    break
    
    # Method 4: Text pattern matching
    if not requirements:
        full_text = soup.get_text(" ", strip=True)
        match = re.search(
            r"(?:Requirements|Eligibility|Skills|Qualifications|Tech Stack)[:\-–]?\s*(.*?)(?:Responsibilities|Duration|About|Perks|Location|Stipend|$)",
            full_text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            text_block = match.group(1)[:500]  # Limit to 500 chars
            items = re.split(r"[•\-\n;]", text_block)
            requirements = [i.strip() for i in items if len(i.strip()) > 5]
    
    # Clean and deduplicate
    requirements = [re.sub(r"\s+", " ", r)[:100] for r in requirements]  # Limit each to 100 chars
    requirements = list(dict.fromkeys(requirements))  # Remove duplicates
    return ", ".join(requirements[:10]) if requirements else "Not specified"

def parse_stipend(soup):
    """Extract stipend amount with multiple fallback methods"""
    try:
        # Method 1: Look for Stipend h3 in Additional Information section (most specific)
        stipend_h3 = soup.find("h3", string=re.compile(r"^\s*Stipend\s*$", re.I))
        if stipend_h3:
            # Get the parent div containing the stipend info
            container = stipend_h3.find_parent("div", class_="cptn")
            if container:
                p_tag = container.find("p")
                if p_tag:
                    stipend_text = p_tag.get_text(" ", strip=True)
                    # Extract amount from "₹ 20,000 /Month" or similar patterns
                    amount_match = re.search(r'₹?\s*([0-9,]+(?:\.[0-9]{2})?)', stipend_text)
                    if amount_match:
                        try:
                            amount = int(amount_match.group(1).replace(",", "").split(".")[0])
                            return str(amount)
                        except:
                            pass
        
        # Method 2: Look for Stipend header and extract from nearby text
        stipend_headers = soup.find_all(["h3", "h4", "h5", "strong", "b", "span"], 
                                       string=re.compile(r"stipend|salary|monthly", re.I))
        
        for header in stipend_headers:
            container = header.find_parent(["div", "p", "section"])
            if container:
                text = container.get_text(" ", strip=True).lower()
                
                if "unpaid" in text or "no stipend" in text:
                    return "Unpaid"
                
                amounts = re.findall(r'₹?\s*([0-9,]+(?:\.[0-9]{2})?)', text)
                if amounts:
                    values = []
                    for amt in amounts:
                        try:
                            values.append(int(amt.replace(",", "").split(".")[0]))
                        except:
                            continue
                    if values:
                        return str(min(values))
        
        # Method 3: Pattern search in full page
        full_text = soup.get_text(" ", strip=True)
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
        
        # Method 4: Check for range patterns
        range_pattern = r'₹?\s*([0-9,]+)\s*(?:-|to)\s*₹?\s*([0-9,]+)'
        range_match = re.search(range_pattern, full_text)
        if range_match:
            try:
                min_amt = int(range_match.group(1).replace(",", ""))
                return str(min_amt)
            except:
                pass
        
        if re.search(r"\bunpaid\b|\bno\s+stipend\b", full_text, re.IGNORECASE):
            return "Unpaid"
            
    except Exception as e:
        print(f"Error parsing stipend: {e}")
    return None

def normalize_stipend(stipend_text):
    """Convert stipend text to integer"""
    if not stipend_text:
        return 0
    text = stipend_text.lower().strip()
    if text in ["unpaid", "not specified", "no stipend", "none", "-", ""]:
        return 0
    matches = re.findall(r"([0-9,]+)", text)
    if matches:
        try:
            values = [int(x.replace(",", "")) for x in matches]
            return min(values)
        except:
            pass
    return 0

def extract_company_info(soup):
    """Extract company name and URL comprehensively"""
    company = "N/A"
    company_url = None
    
    try:
        # Method 1: Look for aria-label with "View details about" pattern
        company_link = soup.find("a", attrs={"aria-label": re.compile(r"View details about", re.I)})
        if company_link:
            company = clean_text(company_link.get_text())
            company_url = company_link.get("href")
        
        # Method 2: Look for company class elements
        if company == "N/A":
            company_elem = soup.find(class_=re.compile("company", re.I))
            if company_elem:
                link = company_elem.find("a")
                if link:
                    company = clean_text(link.get_text())
                    company_url = link.get("href")
                else:
                    company = clean_text(company_elem.get_text())
        
        # Method 3: Look for company name in header/title area
        if company == "N/A":
            header = soup.find("div", class_=re.compile("header|company_header|banner_info", re.I))
            if header:
                company_link = header.find("a")
                if company_link:
                    company = clean_text(company_link.get_text())
                    company_url = company_link.get("href")
        
        # Method 4: Look for meta tags or structured data
        if company == "N/A":
            meta_company = soup.find("meta", {"property": "og:company"}) or \
                          soup.find("span", class_=re.compile("org", re.I))
            if meta_company:
                company = clean_text(meta_company.get_text() or meta_company.get("content", ""))
        
        # Normalize company URL
        if company_url and company_url.startswith("/"):
            company_url = "https://unstop.com" + company_url
        elif company_url and not company_url.startswith("http"):
            company_url = None
            
    except Exception as e:
        print(f"Error extracting company info: {e}")
    
    return company, company_url

# ===============================================================
#                 SELENIUM SETUP
# ===============================================================
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--log-level=3")
chrome_options.add_argument("--headless=new")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# ===============================================================
#                 PAGINATION & SCRAPING
# ===============================================================
print("Starting Unstop scraper...")

base_url = "https://unstop.com/internships?search=computer%20science"
driver.get(base_url)
wait = WebDriverWait(driver, 20)

all_card_urls = set()
prev_count = 0
MAX_PAGES = 10
page = 1

while page <= MAX_PAGES:
    print(f"\n📄 Page {page}")

    # Wait for internship cards
    wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "a[href*='/internships/']")
        )
    )

    soup = BeautifulSoup(driver.page_source, "html.parser")

    cards = soup.select("a[href*='/internships/']")
    for a in cards:
        href = a.get("href")
        if href:
            if href.startswith("/"):
                href = "https://unstop.com" + href
            all_card_urls.add(href)

    print(f"📌 Total internships collected: {len(all_card_urls)}")

    # 🛑 Stop if no new internships loaded
    if len(all_card_urls) == prev_count:
        print("⛔ No new internships → stopping pagination")
        break

    prev_count = len(all_card_urls)

    # Click right arrow
    try:
        next_btn = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "li.right-arrow.num.arrow:not(.disabled)")
            )
        )
        driver.execute_script("arguments[0].click();", next_btn)
        time.sleep(3)  # IMPORTANT: allow Angular API call
        page += 1

    except:
        print("⛔ Pagination button disabled / not found")
        break

print(f"\n✅ Pagination done. Total internships: {len(all_card_urls)}")

# Get all internship URLs from pagination
# while page_num <= MAX_PAGES:
#     try:
#         if page_num == 1:
#             print(f"\nLoading page {page_num}...")
#             driver.get(base_url)
#         else:
#             print(f"\nLoading page {page_num}...")
            
#             # Unstop specific selector: li.right-arrow.num.arrow (single right arrow)
#             try:
#                 # Click the single right arrow (next page button)
#                 next_button = driver.find_element(By.CSS_SELECTOR, "li.right-arrow.num.arrow")
                
#                 # Check if button is disabled (last page)
#                 if "disabled" in next_button.get_attribute("class"):
#                     print(f"✓ No more pages available (last page reached)")
#                     break
                
#                 driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
#                 time.sleep(1)
#                 driver.execute_script("arguments[0].click();", next_button)
#                 print(f"  ✓ Clicked next page button")
#             except Exception as e:
#                 print(f"  ✗ Could not find next page button: {e}")
#                 break
        
#         # Wait for content to load after click (longer wait for dynamic loading)
#         time.sleep(4)
        
#         # Additional wait using Selenium for cards to be present
#         from selenium.webdriver.support.ui import WebDriverWait
#         from selenium.webdriver.support import expected_conditions as EC
#         try:
#             WebDriverWait(driver, 5).until(
#                 EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.item, a[href*='/internships/']"))
#             )
#         except:
#             pass
        
#         time.sleep(1)
#         page_soup = BeautifulSoup(driver.page_source, "html.parser")
#         hrefs = []
        
#         # Debug: Try multiple selectors
#         selectors = [
#             'a.item',
#             'a[href*="/internships/"]',
#             '.internship-card a',
#             'a.internship-link',
#             'div[class*="card"] a[href*="/internships/"]',
#             'a[href^="/internships/"]',
#             '.internship-item a'
#         ]
#         found_with = None
        
#         for selector in selectors:
#             candidates = page_soup.select(selector)
#             if candidates:
#                 print(f"  Selector '{selector}': {len(candidates)} items")
#                 if not found_with:
#                     found_with = selector
        
#         if not found_with:
#             print(f"✗ No internship cards found with any selector")
#             # Save debug page for inspection
#             with open(f"debug_page_{page_num}.html", "w", encoding="utf-8") as f:
#                 f.write(driver.page_source)
#             print(f"  Debug page saved to debug_page_{page_num}.html")
#             break
        
#         print(f"✓ Using selector: {found_with}")
        
#         # Collect all hrefs from this page
#         page_hrefs = []
#         for a in page_soup.select(found_with):
#             href = a.get('href')
#             if href and '/internships/' in href:
#                 if href.startswith('/'):
#                     href = 'https://unstop.com' + href
#                 page_hrefs.append(href)
        
#         # Check if we got new unique URLs (dynamic loading indicator)
#         new_urls_count = 0
#         for h in page_hrefs:
#             if h not in seen_urls_set:
#                 new_urls_count += 1
#                 seen_urls_set.add(h)
#                 all_card_urls.append(h)
        
#         if new_urls_count == 0:
#             # No new URLs found - we're seeing the same page
#             same_page_count += 1
#             print(f"⚠ No new internships found (same page #{same_page_count})")
            
#             if same_page_count >= 2:
#                 print(f"✗ Same page detected 2 times. Stopping pagination.")
#                 break
#         else:
#             same_page_count = 0  # Reset counter when we find new URLs
        
#         print(f"Found {new_urls_count} new internships. Total: {len(all_card_urls)}")
#         page_num += 1

#     except Exception as e:
#         print(f"Error on page {page_num}: {e}")
#         import traceback
#         traceback.print_exc()
#         page_num += 1

# # Setup requests session
# session = requests.Session()
# session.headers.update(HEADERS)

# try:
#     for ck in driver.get_cookies():
#         session.cookies.set(ck.get('name'), ck.get('value'), domain=ck.get('domain'))
# except:
#     pass
session = requests.Session()
# ===============================================================
#                 SCRAPE DETAILS
# ===============================================================
print(f"\nScraping {len(all_card_urls)} internships...\n")

for idx, url in enumerate(all_card_urls, start=1):
    try:
        print(f"\n[{idx}] {url}")
        
        # Fetch page (use Selenium for better JS rendering)
        try:
            driver.get(url)
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, "html.parser")
        except:
            try:
                resp = session.get(url, timeout=15)
                soup = BeautifulSoup(resp.text, "html.parser") if resp.status_code == 200 else None
            except:
                soup = None

        if not soup:
            print(f"✗ Could not parse page")
            continue

        # Extract title (improved with debugging)
        title = "N/A"
        
        # Method 1: Look for h1 in banner_info area first
        banner = soup.find("div", class_=re.compile("banner_info", re.I))
        if banner:
            h1_tag = banner.find("h1")
            if h1_tag:
                title = clean_text(h1_tag.get_text())
                print(f"  ✓ Title (from banner): {title}")
        
        # Method 2: Search all heading tags if not found in banner
        if title == "N/A":
            h_tags = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'])
            print(f"  Found {len(h_tags)} heading tags")
            for t in h_tags:
                candidate = clean_text(t.get_text())
                if candidate and len(candidate) > 5 and len(candidate) < 200:
                    # Skip certain common headers
                    if candidate.lower() not in ["details", "additional information", "registered"]:
                        title = candidate
                        print(f"  ✓ Title: {title}")
                        break
        
        # Method 3: Extract from URL slug as last resort
        if title == "N/A":
            url_slug = url.split('/internships/')[-1].split('-')
            if url_slug:
                title = ' '.join(word.title() for word in url_slug[:-1] if word.isalpha())
                if title:
                    print(f"  ✓ Title (from URL): {title}")

        if not title or title == "N/A":
            print(f"✗ Title not found, skipping")
            # Save debug page
            with open(f"debug_page_{idx}.html", "w", encoding="utf-8") as f:
                f.write(soup.prettify())
            continue

        # Extract company info (improved)
        company, company_url = extract_company_info(soup)
        print(f"  Company: {company}")

        # Check if already exists
        cursor.execute("SELECT id FROM internships WHERE link = %s", (url,))
        if cursor.fetchall():
            print(f"✓ Already exists")
            continue

        # Extract all details
        deadline = parse_deadline(soup) or (datetime.now().date() + timedelta(days=30))
        
        if deadline < date.today():
            print(f"✗ Expired (deadline: {deadline})")
            continue

        stipend_raw = parse_stipend(soup) or "Not specified"
        stipend = normalize_stipend(stipend_raw)
        
        # Extract eligibility
        eligibility = "Not specified"
        eligi_section = soup.find("div", class_="eligibility_sect")
        if eligi_section:
            eligi_divs = eligi_section.find_all("div", class_="eligi")
            if eligi_divs:
                eligibility = ", ".join([clean_text(d.get_text()) for d in eligi_divs])
                print(f"  ✓ Eligibility: {eligibility}")
            else:
                print(f"  ✗ No eligibility items found")
        else:
            print(f"  ✗ Eligibility section not found")

        years = predict_years(eligibility)
        skills = extract_unstop_requirements(soup)
        deadline_str = deadline.isoformat()

        # Insert into database
        for yr in years or [0]:
            cursor.execute("""
                INSERT INTO internships 
                (title, company, company_url, skills, eligibility, source, last_updated, deadline, link, year, stipend)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s)
            """, (title, company, company_url, skills, eligibility, "unstop", deadline_str, url, str(yr), stipend))
            conn.commit()
            print(f"✓ Added: {title} | {company} | Year {yr} | ₹{stipend if stipend > 0 else 'Unpaid'}")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

# Cleanup
driver.quit()
cursor.close()
conn.close()
print("\n✓ Scraping completed!")

# ===============================================================
#           CLASSIFY INTERNSHIPS AS GENUINE/FAKE
# ===============================================================
print("\n" + "="*60)
print("Starting internship classification...")
print("="*60)

try:
    from fake_internship_classifier import classify_from_database
    
    # Classify all scraped internships and remove fake ones
    df_classified = classify_from_database(update_db=True, remove_fake=True)
    
    if df_classified is not None:
        print("\n✓ Classification complete. Fake internships removed.")
        print("✓ Results saved to internships_classified_genuine.csv")
    else:
        print("\n⚠ Classification failed or no data found")
except ImportError:
    print("\n⚠ fake_internship_classifier module not found. Skipping classification.")
except Exception as e:
    print(f"\n⚠ Error during classification: {e}")
