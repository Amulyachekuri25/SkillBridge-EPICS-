// 📁 Backend/Jobs/schedular.js
const cron = require("node-cron");
const { runPythonScript } = require("../Scraper/run_python_scraper");
const { preprocessInternships } = require("../Scraper/preprocess_internships");

let isRunning = false;

async function runScraperJob() {
  if (isRunning) {
    console.log("⚠️ Scraper job already running, skipping...");
    return;
  }
  
  isRunning = true;
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🚀 STARTING FULL SCRAPING JOB AT:", new Date().toLocaleString());
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // Step 1: Scrape Internshala internships
    console.log("📝 Step 1: Scraping Internshala internships...");
    await runPythonScript("internshala.py");
    console.log("✅ Internshala scraping completed!\n");

    // Step 2: Scrape Unstop internships
    console.log("📝 Step 2: Scraping Unstop internships...");
    await runPythonScript("unstop.py");
    console.log("✅ Unstop scraping completed!\n");

    // Step 3: Preprocess and clean internship data
    console.log("🧹 Step 3: Preprocessing internship data...");
    await preprocessInternships();
    console.log("✅ Preprocessing completed!\n");

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ ALL SCRAPERS FINISHED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ ERROR DURING SCRAPING JOB:", err);
    console.error("═══════════════════════════════════════════════════════\n");
  } finally {
    isRunning = false;
  }
}

// ✅ Schedule every 6 hours
cron.schedule("0 */6 * * *", () => {
  console.log("\n⏱️ CRON JOB TRIGGERED: Every 6 hours");
  runScraperJob();
});

// ✅ Schedule daily at 2 AM
cron.schedule("0 2 * * *", () => {
  console.log("\n⏱️ CRON JOB TRIGGERED: Daily at 2:00 AM");
  runScraperJob();
});

// ✅ Run immediately on server startup
console.log("🔄 Running initial scraper job on server startup...");
runScraperJob();

module.exports = runScraperJob;