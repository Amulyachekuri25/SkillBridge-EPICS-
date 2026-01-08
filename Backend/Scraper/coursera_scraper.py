# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import sys

# Preferred course providers
TARGET_SOURCES = [
    "Microsoft", "Google", "IBM", "Cisco", "NPTEL", "Amazon",
    "Meta", "Intel", "Oracle", "Coursera", "EDUCBA"
]

# -------------------------
# DATABASE CONFIGURATION
# -------------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "pass123",
    "database": "skillbridge"
}

# -------------------------
# DATABASE CONNECTION
# -------------------------
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print("[ERROR] Database connection error: " + str(e))
        return None

def create_courses_table():
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skill_courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                skill VARCHAR(255) NOT NULL,
                title VARCHAR(500) NOT NULL,
                source VARCHAR(255),
                url VARCHAR(500),
                price VARCHAR(50),
                enrolled VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_course (skill, title, source),
                INDEX idx_skill (skill),
                INDEX idx_source (source)
            )
        """)
        conn.commit()
        print("[OK] Courses table ready")
        return True
    except Error as e:
        print("[ERROR] Table creation error: " + str(e))
        return False
    finally:
        cursor.close()
        conn.close()

def save_course_to_db(skill, course_data):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO skill_courses (skill, title, source, url, price, enrolled)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            created_at = CURRENT_TIMESTAMP
        """
        cursor.execute(query, (
            skill,
            course_data.get("title", ""),
            course_data.get("source", ""),
            course_data.get("url", ""),
            course_data.get("price", ""),
            course_data.get("enrolled", ""),
        ))
        conn.commit()
        return True
    except Error as e:
        print("[ERROR] Error saving course: " + str(e))
        return False
    finally:
        cursor.close()
        conn.close()

def get_courses_by_skill(skill):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM skill_courses WHERE skill = %s ORDER BY created_at DESC"
        cursor.execute(query, (skill,))
        courses = cursor.fetchall()
        return courses
    except Error as e:
        print("[ERROR] Error fetching courses: " + str(e))
        return []
    finally:
        cursor.close()
        conn.close()

# -------------------------
# EXTRACT COURSE DETAILS
# -------------------------
def extract_details(driver, url):
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
    except:
        return "Unknown", "Unknown"

    price = "Unknown"
    enrolled = "Unknown"

    # Price
    try:
        price_el = driver.find_element(By.XPATH, "//span[contains(@class,'rc-ReactPriceDisplay')]")
        price_text = price_el.text.strip()
        price = "Free" if any(w in price_text.lower() for w in ["free", "audit", "no certificate"]) else "Paid"
    except:
        try:
            driver.find_element(By.XPATH, "//button[contains(@data-track-component,'audit')]")
            price = "Free"
        except:
            price = "Paid"

    # Enrolled
    try:
        el = driver.find_element(By.XPATH, "//p[contains(@class,'css-')]/span/strong/span")
        enrolled = el.text.strip() + " already enrolled"
    except:
        enrolled = "N/A"

    return price, enrolled

# -------------------------
# FAST SCROLL FUNCTION
# -------------------------
def fast_scroll(driver, rounds=5, pause=1.0):
    print("[INFO] Scrolling to load courses...")
    for r in range(rounds):
        driver.execute_script("window.scrollBy(0, document.body.scrollHeight);")
        print(f"[INFO] Scroll round {r+1}")
        time.sleep(pause)
    print("[INFO] Scrolling completed.")

# -------------------------
# SEARCH COURSES
# -------------------------
def search_coursera(skill):
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("user-agent=Mozilla/5.0")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get(f"https://www.coursera.org/search?query={skill}")
    try:
        WebDriverWait(driver, 12).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[data-click-key='search.search.click.search_card']")
            )
        )
    except:
        print("[WARNING] No results loaded.")
        driver.quit()
        return []

    time.sleep(1)
    # Increase scrolling so more search results are loaded
    fast_scroll(driver, rounds=6, pause=1.0)

    links = driver.find_elements(By.CSS_SELECTOR, "a[data-click-key='search.search.click.search_card']")
    courses = []
    skill_lower = skill.lower()

    seen_urls = set()
    for link in links:
        url = link.get_attribute("href")
        if not url:
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)
        try:
            title = link.find_element(By.TAG_NAME, "h3").text.strip()
        except:
            continue
        # Try to collect more context from the card to make matching less strict
        source = "Unknown"
        card_text = ""
        try:
            card = link.find_element(By.XPATH, "./ancestor::div[contains(@class,'cds-ProductCard-content')]")
            card_text = card.text.strip()
            try:
                source_el = card.find_element(By.CSS_SELECTOR, "p.cds-ProductCard-partnerNames")
                source = source_el.text.strip()
            except:
                pass
        except:
            # fallback: try to get some surrounding text
            try:
                parent = link.find_element(By.XPATH, "..")
                card_text = parent.text.strip()
            except:
                pass

        combined = f"{title} {source} {card_text}".lower()
        if skill_lower not in combined:
            # allow broader matches where words of the skill appear (e.g., 'data' in 'data science')
            parts = skill_lower.split()
            if not any(p in combined for p in parts):
                continue

        courses.append({
            "title": title,
            "source": source,
            "url": url,
            "card_text": card_text
        })

    # Filter preferred courses
    # Prefer courses from target sources but keep the list size to 10
    preferred_courses = [c for c in courses if any(s.lower() in (c.get("source") or "").lower() for s in TARGET_SOURCES)]
    other_courses = [c for c in courses if c not in preferred_courses]

    # Ensure deterministic ordering and cap to 10
    final_list = (preferred_courses + other_courses)[:10]

    # Visit each course page to get price and enrolled
    results = []
    for c in final_list:
        price, enrolled = extract_details(driver, c["url"])
        course_data = {
            "title": c["title"],
            "source": c["source"],
            "url": c["url"],
            "price": price,
            "enrolled": enrolled
        }
        results.append(course_data)
        # Save to database
        save_course_to_db(skill, course_data)

    driver.quit()
    return results

# -------------------------
# MAIN EXECUTION
# -------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        skill_input = sys.argv[1]
    else:
        skill_input = input("Enter skill: ")
    
    # Create courses table if it doesn't exist
    create_courses_table()
    
    print(f"[INFO] Scraping courses for skill: {skill_input}")
    results = search_coursera(skill_input)

    if results:
        print(f"[OK] Found and saved {len(results)} courses for '{skill_input}'")
        for course in results:
            print(f"  - {course['title']} ({course['source']})")
    else:
        print(f"[WARNING] No courses found for '{skill_input}'")
