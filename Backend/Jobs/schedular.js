// 📁 Backend/Jobs/schedular.js
const cron = require("node-cron");
const { runPythonScript } = require("../Scraper/run_python_scraper");
const { preprocessInternships } = require("../Scraper/preprocess_internships");
let isRunning = false;
async function runScraperJob() {
  if (isRunning) return;
  isRunning = true;
  console.log("🚀 Starting full scraping job...");

  try {
    // console.log("🔹 Step 3: Scraping Unstop internships...");
    // await runPythonScript("unstop.py");
    
    // console.log("🔹 Step 2: Scraping LinkedIn internships...");
    // await runPythonScript("linkedin.py");  // 1️⃣ Unstop Scraper
    console.log("🔹 Step 1: Scraping Internshala internships...");
    await runPythonScript("internshala.py");
    

    // 2️⃣ LinkedIn Scraper
    
 

    // 3️⃣ Internshala Scraper
    // 4️⃣ Process/clean scraped data
    console.log("🧹 Step 4: Preprocessing internship data...");
    await preprocessInternships();

    console.log("✅ All scrapers finished successfully!");
  } catch (err) {
    console.error("❌ Error during scraping job:", err);
  } finally {
    isRunning = false;
  }
}

// Schedule every 6 hours
cron.schedule("0 */6 * * *", () => {
  console.log("⏱️ Scheduled job: Every 6 hours");
  runScraperJob();
});

// Schedule daily at 2 AM
cron.schedule("0 2 * * *", () => {
  console.log("⏱️ Scheduled job: Once daily at 2:00 AM");
  runScraperJob();
});

// Run immediately on startup
runScraperJob();

module.exports = runScraperJob;
