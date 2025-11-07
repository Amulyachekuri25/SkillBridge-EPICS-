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


# ===============================================================
#                 DATABASE CONNECTION & SETUP
# ===============================================================
# NOTE: Ensure your MySQL service is running and credentials are correct.
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="pass123",
        database="skillbridge",
        autocommit=False
    )
    cursor = conn.cursor()
    print(" Database connection successful.")
except mysql.connector.Error as err:
    print(f" Database Connection Error: {err}")
    # Exit if database connection fails
    exit(1)

# ===============================================================
#                 HELPER FUNCTIONS
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
                    if re.search(r"(Starts|Opens|Begins)", date_text, re.I): continue
                    date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
                    if date_match:
                        date_str = date_match.group(1)
                        for fmt in ("%d %b %y", "%d %b %Y"):
                            try:
                                return datetime.strptime(date_str, fmt).date()
                            except ValueError: continue

        # 2️⃣ Generic fallback (text matching)
        deadline_label = soup.find(
            ["span", "div", "label", "p"],
            string=re.compile(r"(Application Deadline|Registration Deadline|Deadline|Apply By|Last date)", re.I),
        )
        if deadline_label:
            date_tag = deadline_label.find_next(["strong", "b", "time", "span"])
            if date_tag:
                date_text = clean_text(date_tag.get_text(" ", strip=True))
                if re.search(r"(Starts|Opens|Begins)", date_text, re.I): return None
                date_match = re.search(r"(\d{1,2}\s+\w{3}\s+\d{2,4})", date_text)
                if date_match:
                    date_str = date_match.group(1)
                    for fmt in ("%d %b %y", "%d %b %Y"):
                        try:
                            return datetime.strptime(date_str, fmt).date()
                        except ValueError: continue

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
                except ValueError: continue

    except Exception as e:
        print(f"Error parsing deadline: {e}")

    return None


def extract_unstop_requirements(soup):
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
            if requirements: break

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
    # Limit to 5 parts for storage simplicity
    return ", ".join(requirements[:5]) if requirements else "Not specified"


# ===============================================================
#                 SELENIUM DRIVER SETUP
# ===============================================================
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--log-level=3") # Suppress console output

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.get("https://unstop.com/internships?search=computer%20science")
time.sleep(5)


# ===============================================================
#                 INFINITE SCROLL
# ===============================================================
max_scrolls = 50
same_count_limit = 3
same_count = 0
scroll_round = 0
last_count = 0

print("Starting infinite scroll...")

while True:
    try:
        scroll_round += 1
        # Use the correct CSS Selector for the container to scroll
        container = driver.find_element(By.CSS_SELECTOR, "div.user_list.custom-scrollbar")
        driver.execute_script("arguments[0].scrollBy(0, 1000);", container)
        time.sleep(2.5) # Wait for content to load

        cards = driver.find_elements(By.CSS_SELECTOR, "div.single_profile")
        current_count = len(cards)
        print(f"Scroll {scroll_round}: {current_count} internships loaded")

        if current_count == last_count:
            same_count += 1
        else:
            same_count = 0

        last_count = current_count
        
        # Exit conditions
        if same_count >= same_count_limit:
            print(" No new internships loaded — reached end of list.")
            break
        if scroll_round >= max_scrolls:
            print(" Reached max scroll limit (safety stop).")
            break
            
    except Exception as e:
        print(f"Scroll error: {e}")
        break

print(f"\nFinished infinite scrolling — total internships found: {last_count}\n")


# ===============================================================
#                 MAIN SCRAPING LOOP
# ===============================================================
cards = driver.find_elements(By.CSS_SELECTOR, "div.single_profile")
print(f"Total internships to process: {len(cards)}\n")

for idx, card in enumerate(cards, start=1):
    internship_url = None
    try:
        # --- 1. Extract preliminary data from card ---
        title = "N/A"
        company = "N/A"
        try:
            title_elem = card.find_element(By.CSS_SELECTOR, "h2, h3")
            title = clean_text(title_elem.text)
        except Exception: pass

        try:
            company_elem = card.find_element(By.CSS_SELECTOR, "p, div.company-name")
            company = clean_text(company_elem.text)
        except Exception: pass

        internship_id_match = re.search(r"\d+", card.get_attribute("id") or "")
        if not internship_id_match or not title or not company:
            print(f"Skipping card #{idx}: Missing essential data (title/company/ID).")
            continue
            
        internship_id = internship_id_match.group()
        internship_url = f"https://unstop.com/internships/{slugify(title)}-{slugify(company)}-{internship_id}"

        # --- 2. Check for existence (Skip Update Logic) ---
        cursor.execute("SELECT id FROM internships WHERE link = %s", (internship_url,))
        existing_results = cursor.fetchall()
        if existing_results:
            print(f"Skipping existing internship: {title} ({company})")
            continue

        # --- 3. Open detail page ---
        driver.execute_script("window.open(arguments[0]);", internship_url)
        time.sleep(1)
        driver.switch_to.window(driver.window_handles[-1])
        time.sleep(2) # Give page time to load content
        
        soup = BeautifulSoup(driver.page_source, "html.parser")

        # --- 4. Extract detail data ---
        deadline_date = parse_deadline(soup)

        # Apply default deadline (1 month from today) if not found
        if deadline_date is None:
            deadline_date = datetime.now().date() + timedelta(days=30)
            print(f" * Deadline not found, setting to default: {deadline_date.isoformat()}")

        # Skip if deadline is past (even default, though unlikely)
        if deadline_date < date.today():
             print(f" Skipping expired internship: {title} ({company}) — deadline {deadline_date}")
             continue
             
        eligibility_text = "Not specified"
        eligibility_section = soup.find("div", class_="eligibility_sect")
        if eligibility_section:
            eligi_divs = eligibility_section.find_all("div", class_="eligi")
            eligibility_list = [clean_text(div.get_text(strip=True)) for div in eligi_divs if clean_text(div.get_text(strip=True))]
            eligibility_text = ", ".join(eligibility_list) if eligibility_list else eligibility_text

        predicted_years = predict_years(eligibility_text)
        skills_str = extract_unstop_requirements(soup)
        deadline_db = deadline_date.isoformat() if isinstance(deadline_date, date) else None


        # --- 5. Insert new record ---
        for yr in predicted_years or [0]:
            try:
                cursor.execute("""
                    INSERT INTO internships (title, company, link, eligibility, year, skills, source, deadline, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (title, company, internship_url, eligibility_text, str(yr), skills_str, "unstop", deadline_db))
                conn.commit()
                print(f"🆕 Added new internship: {title} ({company}) — Year {yr}")
            except Exception as e:
                conn.rollback()
                print(f"DB insert error for {internship_url} (Year {yr}): {e}")

        print(f"{idx}. {title} ({company}) | Deadline: {deadline_db or 'N/A'}")
        print("-" * 100)

    except Exception as e:
        print(f"Error scraping internship #{idx} ({internship_url}): {e}")
    finally:
        # Close the new tab and switch back to the main tab
        try:
            if len(driver.window_handles) > 1:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
        except Exception:
            # If switching/closing fails, quit and restart driver for robustness
            print("Session lost/switch failed. Restarting driver...")
            driver.quit()
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            driver.get("https://unstop.com/internships?search=computer%20science")
            time.sleep(5)
            driver.switch_to.window(driver.window_handles[0]) # Ensure we are on the main window


# ===============================================================
#                 CLEANUP FUNCTION
# ===============================================================
def delete_expired_internships():
    today = datetime.now().date()
    cursor.execute("SELECT id, title, deadline FROM internships WHERE deadline IS NOT NULL AND deadline < %s", (today.isoformat(),))
    expired = cursor.fetchall()
    for eid, etitle, edead in expired:
        print(f"Deleting expired: id={eid}, title={etitle}, deadline={edead}")
        
    cursor.execute("DELETE FROM internships WHERE deadline IS NOT NULL AND deadline < %s", (today.isoformat(),))
    deleted = cursor.rowcount
    conn.commit()
    print(f"Deleted {deleted} expired internships (past deadline).")


# Run cleanup and close connections
delete_expired_internships()
driver.quit()
cursor.close()
conn.close()
print("\nAll internships scraped, cleaned, and connections closed successfully.")