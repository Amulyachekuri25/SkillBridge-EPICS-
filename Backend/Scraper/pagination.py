from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

print("Starting Unstop pagination...")

driver.get(base_url)
wait = WebDriverWait(driver, 20)

all_card_urls = []
seen_urls = set()
MAX_PAGES = 5
page = 1

while page <= MAX_PAGES:
    print(f"\n📄 Page {page}")

    # Wait for cards to load
    wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "a[href*='/internships/']")
        )
    )

    soup = BeautifulSoup(driver.page_source, "html.parser")

    cards = soup.select("a[href*='/internships/']")
    new_urls = 0

    for a in cards:
        href = a.get("href")
        if not href:
            continue

        if href.startswith("/"):
            href = "https://unstop.com" + href

        if "/internships/" in href and href not in seen_urls:
            seen_urls.add(href)
            all_card_urls.append(href)
            new_urls += 1

    print(f"  ➕ New internships found: {new_urls}")
    print(f"  📌 Total collected: {len(all_card_urls)}")

    # 🔴 Stop condition: no new cards
    if new_urls == 0:
        print("⛔ No new internships → stopping pagination")
        break

    # Try clicking next arrow
    try:
        next_btn = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "li.right-arrow.num.arrow:not(.disabled)")
            )
        )

        # Capture first card before click
        first_card = cards[0].get("href")

        driver.execute_script("arguments[0].scrollIntoView(true);", next_btn)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", next_btn)

        # 🔑 WAIT UNTIL PAGE CONTENT CHANGES
        wait.until_not(
            EC.presence_of_element_located(
                (By.XPATH, f"//a[contains(@href, '{first_card.split('/')[-1]}')]")
            )
        )

        time.sleep(2)
        page += 1

    except Exception as e:
        print(f"⛔ Pagination stopped: {e}")
        break

print(f"\n✅ Pagination complete. Total internships collected: {len(all_card_urls)}")
