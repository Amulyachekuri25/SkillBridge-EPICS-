
from bs4 import BeautifulSoup
import requests
import mysql.connector
from datetime import datetime, date
import time
from dateutil.relativedelta import relativedelta
import subprocess
import json
# You may need to run: pip install python-dateutil

# ---------- DATABASE CONNECTION ----------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="pass123",  # change to your MySQL password
    database="skillbridge"
)
cursor = conn.cursor()

# ---------- BASE SETTINGS ----------
BASE_URL = "https://internshala.com"
START_URL = f"{BASE_URL}/internships/computer-science-internship/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.5"
}


def is_fake_internship(company_url):
    """
    Calls the Node.js fake internship detector and returns True/False.
    """
    try:
        # Call Node.js script with company_url as argument
        result = subprocess.run(
            ["node", "fake_internship.js", company_url],
            capture_output=True,
            text=True,
            timeout=20
        )

        # Try to parse JSON output
        output = result.stdout.strip()
        if output:
            try:
                data = json.loads(output)
                return data.get("isFake", True)
            except json.JSONDecodeError:
                pass

        # Default: treat as fake if no valid output
        return True

    except Exception as e:
        print(f"Error calling fake detector for {company_url}: {e}")
        return True

# ---------- YEAR PREDICTION FUNCTION (Unchanged) ----------
def predict_years(eligibility):
    eligibility = eligibility.lower()

    if any(word in eligibility for word in ["1st", "first"]):
        return [1]
    if any(word in eligibility for word in ["2nd", "second"]):
        return [2]
    if any(word in eligibility for word in ["3rd", "third", "pre-final"]):
        return [3]
    if any(word in eligibility for word in ["4th", "fourth", "final", "fresher"]):
        return [4]
    if any(word in eligibility for word in ["undergraduate", "engineering", "any", "all"]):
        return [1, 2, 3, 4]
    if "postgraduate" in eligibility:
        return ["PG"]

    open_phrases = [
        "have relevant skills",
        "anyone can apply",
        "open to all",
        "start/restart their career",
        "skills and interests",
        "career can also apply"
    ]
    if any(phrase in eligibility for phrase in open_phrases):
        return [1, 2, 3, 4]

    return []

# ---------- REVISED DEADLINE PARSING FUNCTION (Robustly returns date) ----------
def parse_deadline(soups):
    """
    Extracts the application deadline date from the internship page.
    Returns a calculated date (1 month from now) if the deadline is not found.
    """
    try:
        # Check for the explicit 'Apply By' date
        labels = soups.find_all('div', class_='other_detail_item')
        for label in labels:
            text = label.text.strip().lower()
            if "apply by" in text:
                date_text = text.replace("apply by", "").strip()
                # Assuming format like "15 Nov' 25"
                date_obj = datetime.strptime(date_text, "%d %b' %y").date()
                return date_obj
    except Exception:
        pass # If parsing fails, proceed to calculated deadline
    
    # If deadline is not found or parsing fails, return a calculated date (1 month from now)
    calculated_deadline = date.today() + relativedelta(months=1)
    return calculated_deadline

# ---------- MODIFIED SAVE TO DATABASE FUNCTION (REMOVED UPDATE LOGIC) ----------
def save_to_db(internship):
    # 1. Check for duplicate (ONLY check, no update logic)
    cursor.execute("SELECT deadline FROM internships WHERE link = %s AND year = %s", (internship['link'], internship['year']))
    existing_record = cursor.fetchone()
    
    # Use the newly scraped/calculated deadline
    deadline_to_save = internship['deadline'] 
    
    if existing_record:
        # 2. Case: Existing Record Found (SKIP)
        print(f"Skipping existing internship ({internship['year']} yr): {internship['title']} (Deadline: {existing_record[0]})")
    else:
        # 3. Case: New Record (INSERT)
        cursor.execute('''
            INSERT INTO internships 
            (title, company, company_url, skills, eligibility, source, last_updated, deadline, link, year)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,%s)
        ''', (
            internship['title'], internship['company'], internship['company_url'],
            internship['skills'], internship['eligibility'], internship['source'],
            internship['last_updated'], deadline_to_save, internship['link'], internship['year']
        ))
        print(f"Added internship ({internship['year']} yr): {internship['title']} (Deadline: {deadline_to_save})")
    
    conn.commit()

# ---------- SCRAPER FUNCTION (Unchanged) ----------
def scrape_internshala():
    page = 1
    while True:
        print(f"Scraping Page {page}...")
        page_url = f"{START_URL}/page-{page}" if page > 1 else START_URL
        response = requests.get(page_url, headers=HEADERS)
        soup = BeautifulSoup(response.content, "html.parser")

        links = soup.find_all("a", attrs={'class': 'job-title-href'})
        if not links:
            print("No more internships found — scraping complete.")
            break

        for link in links:
            try:
                intern_link = BASE_URL + link.get("href")
                new_page = requests.get(intern_link, headers=HEADERS)
                soups = BeautifulSoup(new_page.content, "html.parser")

                # Title
                title_tag = soups.find('div', attrs={'class': 'heading_4_5 profile'})
                title = title_tag.text.strip() if title_tag else "N/A"

                # Company
                cmp_tag = soups.find('a', attrs={'class': 'link_display_like_text'})
                cmp_name = cmp_tag.text.strip() if cmp_tag else "N/A"
                cmp_url = cmp_tag['href'] if cmp_tag and cmp_tag.has_attr('href') else "N/A"

                # Skills
                skills_tag = soups.find('div', attrs={'class': 'round_tabs_container'})
                skills = ', '.join(skills_tag.text.strip('\n').split('\n')) if skills_tag else "N/A"

                # Eligibility
                eligibility_tag = soups.find('div', attrs={'class': 'text-container who_can_apply'})
                if eligibility_tag:
                    lines = [line.strip() for line in eligibility_tag.text.split('\n') if line.strip()]
                    eligibility = ' '.join(lines)
                else:
                    eligibility = "N/A"
                
                # Deadline - USES REVISED FUNCTION
                deadline = parse_deadline(soups)

                # Core internship info
                internship = {
                    'title': title,
                    'company': cmp_name,
                    'company_url': cmp_url,
                    'skills': skills,
                    'eligibility': eligibility,
                    'source': 'Internshala',
                    'last_updated': date.today(),
                    'link': intern_link,
                    'deadline' : deadline
                }

                # Predict eligible years
                years = predict_years(eligibility)
                if years:
                    for year in years:
                        internship['year'] = year
                        save_to_db(internship)
                else:
                    internship['year'] = None
                    save_to_db(internship)

                time.sleep(0.5)

            except Exception as e:
                print(f"Error scraping internship: {e}")
                continue

        page += 1
        time.sleep(2)
        
# ---------- DELETE EXPIRED FUNCTION (Unchanged) ----------
def delete_expired_internships():
    today = date.today()
    cursor.execute("DELETE FROM internships WHERE deadline IS NOT NULL AND deadline < %s", (today,))
    deleted_count = cursor.rowcount
    conn.commit()
    print(f" Deleted {deleted_count} expired internships (deadline passed).")

# ---------- MAIN (Unchanged) ----------
def run_daily():
    delete_expired_internships()  # remove expired ones first
    scrape_internshala()
    delete_expired_internships()  # clean again after new scrape
    print(" Scraping completed & database updated.")

# ---------- EXECUTE (Unchanged) ----------
if __name__ == "__main__":
    run_daily()