# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from webdriver_manager.chrome import ChromeDriverManager
# import mysql.connector
# from datetime import date, datetime, timedelta
# import time
# import re

# # ---------- CONFIG ----------
# START_URL = "https://unstop.com/internships?search=computer%20science"

# DB_CONFIG = {
#     "host": "localhost",
#     "user": "root",
#     "password": "pass123",
#     "database": "skillbridge"
# }

# # ---------- 50 CSE KEYWORDS ----------
# CSE_KEYWORDS = [
#     "computer", "software", "developer", "development", "programming",
#     "coding", "python", "java", "c++", "c#", "javascript",
#     "typescript", "html", "css", "react", "angular", "vue",
#     "node", "nodejs", "express", "django", "flask", "spring",
#     "sql", "mysql", "postgresql", "mongodb", "firebase",
#     "data", "datascience", "machine learning", "deep learning",
#     "artificial intelligence", "ai", "ml",
#     "cloud", "aws", "azure", "gcp",
#     "devops", "docker", "kubernetes",
#     "linux", "git", "github",
#     "api", "rest", "graphql",
#     "testing", "automation", "selenium",
#     "cybersecurity", "blockchain",
#     "backend", "frontend", "full stack"
# ]

# # ---------- CSE FILTER FUNCTION ----------
# def is_cse_related(title, skills, eligibility):
#     text = " ".join(filter(None, [title, skills, eligibility])).lower()
#     return any(keyword in text for keyword in CSE_KEYWORDS)

# # ---------- MYSQL ----------
# db = mysql.connector.connect(**DB_CONFIG)
# cursor = db.cursor()

# # ---------- SELENIUM ----------
# options = webdriver.ChromeOptions()
# options.add_argument("--headless")
# options.add_argument("--window-size=1920,1080")

# driver = webdriver.Chrome(
#     service=Service(ChromeDriverManager().install()),
#     options=options
# )
# wait = WebDriverWait(driver, 20)

# # ---------- GET INTERNSHIP LINKS ----------
# driver.get(START_URL)
# for _ in range(8):
#     driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
#     time.sleep(2)
# # ---------- GET INTERNSHIP LINKS WITH PAGINATION ----------
# all_links = []

# while True:
#     # 1️⃣ Collect internship links on current page
#     cards = wait.until(
#         EC.presence_of_all_elements_located(
#             (By.XPATH, "//a[contains(@href,'/internship')]")
#         )
#     )
#     page_links = [c.get_attribute("href") for c in cards]
#     all_links.extend(page_links)
#     print(f"Collected {len(page_links)} links from current page")

#     # 2️⃣ Check if 'Next' page exists and is clickable
#     try:
#         next_btn = driver.find_element(
#             By.XPATH, "//ul[contains(@class,'pagination')]//li[a[contains(text(),'Next')]]"
#         )

#         # Check if the button is disabled
#         if "disabled" in next_btn.get_attribute("class").lower():
#             print("Reached last page")
#             break

#         # Click next page
#         next_btn.click()
#         time.sleep(2)  # wait for new page to load

#     except:
#         print("No more pages / pagination ended")
#         break

# # Remove duplicates
# internship_links = list(set(all_links))
# print("Total internships collected:", len(internship_links))


# cards = wait.until(
#     EC.presence_of_all_elements_located(
#         (By.XPATH, "//a[contains(@href,'/internship')]")
#     )
# )

# internship_links = list({c.get_attribute("href") for c in cards})
# print("Found internship links:", len(internship_links))
# def parse_deadline_date_only(date_text):
#     """
#     Converts absolute or relative deadline text
#     into DATE ONLY (YYYY-MM-DD)
#     """
#     today = datetime.today().date()
#     text = date_text.lower().strip()

#     # -------- HOURS LEFT → TODAY --------
#     if "hour" in text:
#         return today

#     # -------- DAYS LEFT --------
#     if "day" in text:
#         days = int(re.search(r"\d+", text).group())
#         return today + timedelta(days=days)

#     # -------- ABSOLUTE DATE --------
#     try:
#         return datetime.strptime(
#             text.replace("ist", "").strip(),
#             "%d %b %y, %I:%M %p"
#         ).date()
#     except:
#         return datetime.strptime(
#             text.split(",")[0].strip(),
#             "%d %b %y"
#         ).date()

# # ---------- SCRAPE DETAILS ----------
# for link in internship_links:
#     try:
#         driver.get(link)
#         time.sleep(2)

#         # ---------- TITLE ----------
#         try:
#             title = wait.until(
#                 EC.visibility_of_element_located((By.XPATH, "//h1"))
#             ).text.strip()
#         except:
#             title = None

#         # ---------- COMPANY ----------
#         # try:
#         #     company_elem = wait.until(
#         #         EC.visibility_of_element_located((
#         #             By.XPATH,
#         #             "//div[contains(@class,'desktop_views')]/a[contains(@class,'location')]"
#         #         ))
#         #     )
#         #     company_name = company_elem.text.strip()
#         #     company_url = company_elem.get_attribute("href")
#         # except:
#         #     company_name = None
#         #     company_url = None
#         try:
#             company_anchor = wait.until(
#                 EC.presence_of_element_located((
#                     By.XPATH,
#                     "//div[contains(@class,'desktop_views')]//a[contains(@class,'location')]"
#                 ))
#             )

#             company_name = company_anchor.text.strip()
#             company_url = company_anchor.get_attribute("href")

#         except:
#             company_name = None
#             company_url = None


#         # ---------- SKILLS ----------
#         skills = ", ".join(
#             s.text for s in driver.find_elements(
#                 By.XPATH, "//span[contains(@class,'skill')]"
#             )
#         )

#         # ---------- ELIGIBILITY ----------
#         try:
#             eligibility_container = driver.find_element(
#                 By.CSS_SELECTOR,
#                 "div.eligibility_sect div.items"
#             )
#             eligibility = ", ".join(
#                 e.text.strip()
#                 for e in eligibility_container.find_elements(
#                     By.CSS_SELECTOR, "div.eligi"
#                 )
#             )
#         except:
#             eligibility = None

#         # ---------- CSE FILTER ----------
#         if not is_cse_related(title, skills, eligibility):
#             print("Skipped (Not CSE):", title)
#             print("-" * 60)
#             continue

#         # ---------- DEADLINE (ANGULAR SAFE) ----------
#         try:
#             driver.execute_script("window.scrollBy(0, 1000);")
#             time.sleep(1)

#             deadline_elem = wait.until(
#                 EC.presence_of_element_located((
#                     By.XPATH,
#                     "//span[normalize-space()='Application Deadline']/following-sibling::strong"
#                 ))
#             )

#             wait.until(lambda d: deadline_elem.text.strip() != "")
#             raw_text = deadline_elem.text.strip()

#             deadline = parse_deadline_date_only(raw_text)
#             print("Deadline Date:", deadline)
#         except Exception as e:
#             print("Deadline not found:", e)
#             deadline = None

#         # ---------- YEAR ----------
#         year = "Any"
#         if eligibility:
#             e = eligibility.lower()
#             if "1st" in e: year = "1"
#             elif "2nd" in e: year = "2"
#             elif "3rd" in e: year = "3"
#             elif "4th" in e: year = "4"
#             elif "pg" in e or "post graduate" in e: year = "PG"

#         # ---------- STIPEND ----------
#         stipends = driver.find_elements(
#             By.XPATH, "//div[h3[text()='Stipend']]/p"
#         )
#         min_stipend = stipends[0].text.split(":")[-1].strip() if len(stipends) > 0 else None

#         # ---------- INSERT INTO DB ----------
#         query = """
#         INSERT INTO internships
#         (title, company, company_url, skills, eligibility,
#          source, last_updated, deadline, link, year, stipend)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#         """


#         values = (
#             title, company_name, company_url, skills, eligibility,
#             "Unstop", date.today(), deadline, link, year, min_stipend
#         )
#         print(values)
#         try:
#             cursor.execute(query, values)
#             db.commit()
#             print("Inserted:", title)
#         except mysql.connector.errors.IntegrityError:
#             print("Duplicate skipped:", title)

#         print("-" * 60)

#     except Exception as e:
#         print("Error scraping:", link, e)

# # ---------- CLEANUP ----------
# driver.quit()
# cursor.close()
# db.close()
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import mysql.connector
from datetime import date, datetime, timedelta
import time
import re

def parse_stipend(stipend_text, mode="min"):
    """
    mode = 'min'  -> take minimum stipend
    mode = 'avg'  -> take average stipend
    Returns integer stipend amount or None
    """

    if not stipend_text:
        return None

    text = stipend_text.lower()

    # Unpaid / Performance based
    if "unpaid" in text or "performance" in text:
        return 0

    # Extract all numeric values
    amounts = re.findall(r"\d{1,3}(?:,\d{3})*", stipend_text)
    amounts = [int(a.replace(",", "")) for a in amounts]

    if not amounts:
        return None

    # Single value
    if len(amounts) == 1:
        return amounts[0]

    # Range value
    min_val, max_val = min(amounts), max(amounts)

    if mode == "avg":
        return (min_val + max_val) // 2

    # Default → minimum
    return min_val


# ---------- CONFIG ----------
START_URL = "https://unstop.com/internships?search=computer%20science"

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "pass123",
    "database": "skillbridge"
}

# ---------- 50 CSE KEYWORDS ----------
CSE_KEYWORDS = [
    "computer", "software", "developer", "development", "programming",
    "coding", "python", "java", "c++", "c#", "javascript",
    "typescript", "html", "css", "react", "angular", "vue",
    "node", "nodejs", "express", "django", "flask", "spring",
    "sql", "mysql", "postgresql", "mongodb", "firebase",
    "data", "datascience", "machine learning", "deep learning",
    "artificial intelligence", "ai", "ml",
    "cloud", "aws", "azure", "gcp",
    "devops", "docker", "kubernetes",
    "linux", "git", "github",
    "api", "rest", "graphql",
    "testing", "automation", "selenium",
    "cybersecurity", "blockchain",
    "backend", "frontend", "full stack"
]

# ---------- CSE FILTER FUNCTION ----------
def is_cse_related(title, skills, eligibility):
    text = " ".join(filter(None, [title, skills, eligibility])).lower()
    return any(keyword in text for keyword in CSE_KEYWORDS)

# ---------- MYSQL ----------
db = mysql.connector.connect(**DB_CONFIG)
cursor = db.cursor()

# ---------- SELENIUM ----------
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--window-size=1920,1080")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)
wait = WebDriverWait(driver, 20)

# ---------- GET INTERNSHIP LINKS ----------
driver.get(START_URL)
for _ in range(8):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
# ---------- GET INTERNSHIP LINKS WITH PAGINATION ----------
all_links = []

while True:
    # 1️⃣ Collect internship links on current page
    cards = wait.until(
        EC.presence_of_all_elements_located(
            (By.XPATH, "//a[contains(@href,'/internship')]")
        )
    )
    page_links = [c.get_attribute("href") for c in cards]
    all_links.extend(page_links)
    print(f"Collected {len(page_links)} links from current page")

    # 2️⃣ Check if 'Next' page exists and is clickable
    try:
        next_btn = driver.find_element(
            By.XPATH, "//ul[contains(@class,'pagination')]//li[a[contains(text(),'Next')]]"
        )

        # Check if the button is disabled
        if "disabled" in next_btn.get_attribute("class").lower():
            print("Reached last page")
            break

        # Click next page
        next_btn.click()
        time.sleep(2)  # wait for new page to load

    except:
        print("No more pages / pagination ended")
        break

# Remove duplicates
internship_links = list(set(all_links))
print("Total internships collected:", len(internship_links))


cards = wait.until(
    EC.presence_of_all_elements_located(
        (By.XPATH, "//a[contains(@href,'/internship')]")
    )
)

internship_links = list({c.get_attribute("href") for c in cards})
print("Found internship links:", len(internship_links))
def parse_deadline_date_only(date_text):
    """
    Converts absolute or relative deadline text
    into DATE ONLY (YYYY-MM-DD)
    """
    today = datetime.today().date()
    text = date_text.lower().strip()

    # -------- HOURS LEFT → TODAY --------
    if "hour" in text:
        return today

    # -------- DAYS LEFT --------
    if "day" in text:
        days = int(re.search(r"\d+", text).group())
        return today + timedelta(days=days)

    # -------- ABSOLUTE DATE --------
    try:
        return datetime.strptime(
            text.replace("ist", "").strip(),
            "%d %b %y, %I:%M %p"
        ).date()
    except:
        return datetime.strptime(
            text.split(",")[0].strip(),
            "%d %b %y"
        ).date()
def extract_requirements_as_skills(driver, wait):
    try:
        # Find the "Requirements:" <p> tag
        requirements_heading = wait.until(
            EC.presence_of_element_located((
                By.XPATH,
                "//div[@id='tab-detail']//p[strong[normalize-space()='Requirements:']]"
            ))
        )

        # The <ul> immediately following Requirements
        requirements_ul = requirements_heading.find_element(
            By.XPATH, "following-sibling::ul[1]"
        )

        skills = ", ".join(
            li.text.strip()
            for li in requirements_ul.find_elements(By.TAG_NAME, "li")
            if li.text.strip()
        )

        return skills

    except Exception as e:
        print("Requirements not found:", e)
        return None

# ---------- SCRAPE DETAILS ----------
for link in internship_links:
    try:
        driver.get(link)
        time.sleep(2)

        # ---------- TITLE ----------
        try:
            title = wait.until(
                EC.visibility_of_element_located((By.XPATH, "//h1"))
            ).text.strip()
        except:
            title = None

        # ---------- COMPANY ----------
        # try:
        #     company_elem = wait.until(
        #         EC.visibility_of_element_located((
        #             By.XPATH,
        #             "//div[contains(@class,'desktop_views')]/a[contains(@class,'location')]"
        #         ))
        #     )
        #     company_name = company_elem.text.strip()
        #     company_url = company_elem.get_attribute("href")
        # except:
        #     company_name = None
        #     company_url = None
        try:
            company_anchor = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//div[contains(@class,'desktop_views')]//a[contains(@class,'location')]"
                ))
            )

            company_name = company_anchor.text.strip()
            company_url = company_anchor.get_attribute("href")

        except:
            company_name = None
            company_url = None


        # ---------- SKILLS ----------
        skills = extract_requirements_as_skills(driver, wait)

        # ---------- ELIGIBILITY ----------
        try:
            eligibility_container = driver.find_element(
                By.CSS_SELECTOR,
                "div.eligibility_sect div.items"
            )
            eligibility = ", ".join(
                e.text.strip()
                for e in eligibility_container.find_elements(
                    By.CSS_SELECTOR, "div.eligi"
                )
            )
        except:
            eligibility = None

        # ---------- CSE FILTER ----------
        if not is_cse_related(title, skills, eligibility):
            print("Skipped (Not CSE):", title)
            print("-" * 60)
            continue

        # ---------- DEADLINE (ANGULAR SAFE) ----------
        try:
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(1)

            deadline_elem = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//span[normalize-space()='Application Deadline']/following-sibling::strong"
                ))
            )

            wait.until(lambda d: deadline_elem.text.strip() != "")
            raw_text = deadline_elem.text.strip()

            deadline = parse_deadline_date_only(raw_text)
            print("Deadline Date:", deadline)
        except Exception as e:
            print("Deadline not found:", e)
            deadline = None

        # ---------- YEAR ----------
        year = "Any"
        if eligibility:
            e = eligibility.lower()
            if "1st" in e: year = "1"
            elif "2nd" in e: year = "2"
            elif "3rd" in e: year = "3"
            elif "4th" in e: year = "4"
            elif "pg" in e or "post graduate" in e: year = "PG"

        # ---------- STIPEND ----------
        stipends = driver.find_elements(
            By.XPATH, "//div[h3[text()='Stipend']]/p"
        )
        min_stipend = parse_stipend(stipends, mode="min")  # Default None

        # ---------- INSERT INTO DB ----------
        query = """
        INSERT INTO internships
        (title, company, company_url, skills, eligibility,
         source, last_updated, deadline, link, year, stipend)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """


        values = (
            title, company_name, company_url, skills, eligibility,
            "Unstop", date.today(), deadline, link, year, min_stipend
        )
        print(values)
        try:
            cursor.execute(query, values)
            db.commit()
            print("Inserted:", title)
        except mysql.connector.errors.IntegrityError:
            print("Duplicate skipped:", title)

        print("-" * 60)

    except Exception as e:
        print("Error scraping:", link, e)

# ---------- CLEANUP ----------
driver.quit()
cursor.close()
db.close()
