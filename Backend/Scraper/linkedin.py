
import time
import re
import mysql.connector
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By 
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from datetime import datetime, date, timedelta

# ===============================================================
#                   CONFIGURATION
# ===============================================================
MAX_PAGES = 10       # Max number of pages to scrape (40 pages * 25 jobs = 1000 jobs)
JOBS_PER_PAGE = 25   # Standard number of jobs per page on LinkedIn

# ===============================================================
#                   DATABASE CONNECTION & SETUP
# ===============================================================
# ⚠️ Ensure your MySQL server is running and credentials are correct
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="pass123",  # change if needed
    database="skillbridge"
)
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    link VARCHAR(500),
    eligibility TEXT,
    year VARCHAR(50),
    skills TEXT,
    source VARCHAR(50),
    deadline VARCHAR(100),
    last_updated DATETIME,
    UNIQUE (link, year)
)
""")
conn.commit()

# ===============================================================
#                   LINKEDIN SCRAPER CONFIG
# ===============================================================
# Base URL for the job search query
LINKEDIN_URL = "https://www.linkedin.com/jobs/search/?keywords=computer%20science%20internship&location=India"

# ===============================================================
#                   YEAR PREDICTION FUNCTION
# ===============================================================
def predict_years(eligibility):
    """Predicts relevant student academic years based on eligibility text."""
    eligibility = eligibility.lower()
    if any(w in eligibility for w in ["1st", "first"]): return [1]
    if any(w in eligibility for w in ["2nd", "second"]): return [2]
    if any(w in eligibility for w in ["3rd", "third", "pre-final"]): return [3]
    if any(w in eligibility for w in ["4th", "fourth", "final", "fresher"]): return [4]
    
    # Catch-all phrases
    open_phrases = ["undergraduate", "engineering", "any", "all", "everyone", "anyone can apply", "open to all", "career can also apply"]
    if any(p in eligibility for p in open_phrases): 
        return [1, 2, 3, 4]
        
    return []

# ===============================================================
#                   SELENIUM SETUP
# ===============================================================
print("⚙️ Setting up Selenium and Chrome...")
chrome_options = Options()
chrome_options.add_argument("--headless") # Runs Chrome in background for efficiency
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--disable-notifications")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
except Exception as e:
    print(f"FATAL ERROR: Could not initialize ChromeDriver. Ensure Chrome is installed and up to date. Error: {e}")
    exit()

# ===============================================================
#                   PAGINATION LOOP
# (Iterates through pages using the '&start=' URL parameter with increment 25)
# ===============================================================
print(f"Initiating Pagination. Target: {MAX_PAGES} pages (approx. {MAX_PAGES * JOBS_PER_PAGE} jobs)...")

total_processed_cards = 0
total_added_updated = 0
total_discarded = 0
today = date.today()

for page_num in range(MAX_PAGES):
    start_index = page_num * JOBS_PER_PAGE # This generates 0, 25, 50, 75, ...
    
    # Construct the paginated URL
    paginated_url = f"{LINKEDIN_URL}&start={start_index}"
    
    # print(f"\nLoading Page {page_num + 1} (Start Index: {start_index})")
    driver.get(paginated_url)
    
    # Wait for the page content to fully load
    time.sleep(3) 

    # Parse the current page source
    soup = BeautifulSoup(driver.page_source, "html.parser")
    cards = soup.select("ul.jobs-search__results-list li")

    if not cards:
        print(f" Page {page_num + 1} returned zero job cards. Assuming end of results and stopping.")
        break
    
    total_processed_cards += len(cards)
    # print(f" Found {len(cards)} cards on this page. Total cards found so far: {total_processed_cards}")

    # ===============================================================
    #                   PARSE AND PROCESS INTERNSHIPS
    # (The processing logic is now inside the pagination loop)
    # ===============================================================
    
    for i, card in enumerate(cards, start=1):
        try:
            title_tag = card.select_one("h3.base-search-card__title")
            company_tag = card.select_one("h4.base-search-card__subtitle a")
            link_tag = card.select_one("a.base-card__full-link")
            post_date_tag = card.select_one("time") 

            title = title_tag.get_text(strip=True) if title_tag else "N/A"
            company = company_tag.get_text(strip=True) if company_tag else "N/A"
            link = link_tag["href"].split("?")[0] if link_tag and "href" in link_tag.attrs else "N/A"
            
            # --- DEADLINE CALCULATION ---
            deadline_str = "N/A"
            post_date_raw = post_date_tag["datetime"] if post_date_tag and post_date_tag.has_attr("datetime") else None

            if post_date_raw:
                try:
                    post_date = datetime.strptime(post_date_raw, "%Y-%m-%d").date()
                    
                    # Assume a fixed application period of 30 days for an ESTIMATED deadline
                    estimated_deadline_date = post_date + timedelta(days=30) 
                    deadline_str = estimated_deadline_date.strftime("%Y-%m-%d")

                    # --- CHECK FOR EXPIRATION (DISCARD IF OUT OF DATE) ---
                    if estimated_deadline_date < today:
                        total_discarded += 1
                        # print(f"   Discarded (Expired): {title} (Est. Deadline: {deadline_str})")
                        continue # Skip to the next card

                except Exception:
                    deadline_str = "N/A" # If date parsing fails, treat as N/A


            # --- DATA PREP FOR VALID (Non-Expired) INTERNSHIPS ---
            if any(term in title.lower() for term in ["software", "developer", "engineer", "data", "ai", "ml", "computer"]):
                eligibility = "Computer Science Engineering, IT, related fields"
            else:
                eligibility = "Open to all streams"

            predicted_years = predict_years(eligibility)
            if not predicted_years:
                predicted_years = [1, 2, 3, 4]

            skill_text = title + " " + eligibility 
            skill_pattern = re.compile(r"(python|java|c\+\+|html|css|javascript|sql|react|node|ml|ai|data|cloud)", re.IGNORECASE)
            skills = list(set(skill_pattern.findall(skill_text.lower())))
            if not skills:
                skills = ["N/A"]

            last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # --- ADD/UPDATE TO DATABASE ---
            for yr in predicted_years:
                total_added_updated += 1
                # Optional: print details for non-discarded items
                # print(f"  Adding/Updating: {title} @ {company} for Year {yr} (Deadline: {deadline_str})")

                cursor.execute("""
                    INSERT INTO internships (title, company, link, eligibility, year, skills, source, deadline, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        company = VALUES(company),
                        eligibility = VALUES(eligibility),
                        skills = VALUES(skills),
                        source = VALUES(source),
                        deadline = VALUES(deadline),
                        last_updated = VALUES(last_updated)
                """, (title, company, link, eligibility, str(yr), ", ".join(skills), "LinkedIn", deadline_str, last_updated))
                conn.commit()

        except Exception as e:
            print(f"Error processing card (page {page_num + 1}, card {i}): {e}")
            continue

# ===============================================================
#             CLEANUP AND SUMMARY
# ===============================================================
driver.quit()
conn.close()

# print("\n--- SCRAPING SUMMARY ---")
# print(f"Total unique job cards found across all pages: {total_processed_cards}")
# print(f"Successfully Added/Updated records (multiple years per job counted): {total_added_updated}")
# print(f"Discarded records (Estimated deadline passed): {total_discarded}")
print("Process Complete. Database updated via pagination!\n")
