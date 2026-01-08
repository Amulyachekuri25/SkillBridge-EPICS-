require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

// ✅ Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const internshipRoutes = require("./routes/internshipRoutes");
const coursesRoutes = require("./routes/courses");
const applicationsRoutes = require("./routes/applications");
const adminRoutes = require("./routes/admin");

// ✅ Import Scraper and Preprocessing Modules
const runScraperJob = require("./Jobs/schedular");
const { runPythonScript } = require("./Scraper/run_python_scraper");
const { preprocessInternships } = require("./Scraper/preprocess_internships");

// Initialize Express App
const app = express();

// ✅ Enable CORS for Vite frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ Middleware MUST come before routes
app.use(express.json());
app.use(bodyParser.json());

// ✅ Start scraper job on server startup
runScraperJob();

// ✅ Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", internshipRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/admin", adminRoutes);

// ✅ SCRAPER MANAGEMENT ENDPOINTS ✅
// Manual trigger for all scrapers
app.post("/api/admin/scrape-all", async (req, res) => {
  try {
    console.log("🚀 Manual scraper triggered - Running ALL scrapers...");
    // Run preprocessing
    console.log("🧹 Step 3: Preprocessing internship data...");
    await preprocessInternships();
    // Run Internshala scraper
    console.log("📝 Step 1: Scraping Internshala internships...");
    await runPythonScript("internshala.py");
    
    // Run Unstop scraper
    console.log("📝 Step 2: Scraping Unstop internships...");
    await runPythonScript("unstop.py");
    
    
    
    res.json({ 
      success: true, 
      message: "✅ All scrapers completed successfully!" 
    });
  } catch (err) {
    console.error("❌ Error during scraping:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Scrape Internshala only
app.post("/api/admin/scrape-internshala", async (req, res) => {
  try {
    console.log("🚀 Scraping Internshala internships...");
    await runPythonScript("internshala.py");
    res.json({ 
      success: true, 
      message: "✅ Internshala scraping completed!" 
    });
  } catch (err) {
    console.error("❌ Error scraping Internshala:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Scrape Unstop only
app.post("/api/admin/scrape-unstop", async (req, res) => {
  try {
    console.log("🚀 Scraping Unstop internships...");
    await runPythonScript("unstop.py");
    res.json({ 
      success: true, 
      message: "✅ Unstop scraping completed!" 
    });
  } catch (err) {
    console.error("❌ Error scraping Unstop:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Run preprocessing only
app.post("/api/admin/preprocess", async (req, res) => {
  try {
    console.log("🧹 Running preprocessing...");
    await preprocessInternships();
    res.json({ 
      success: true, 
      message: "✅ Preprocessing completed successfully!" 
    });
  } catch (err) {
    console.error("❌ Error during preprocessing:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get scraper status
app.get("/api/admin/scraper-status", (req, res) => {
  res.json({
    status: "running",
    lastRun: new Date(),
    message: "Scraper is active with scheduled jobs every 6 hours and daily at 2:00 AM"
  });
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("SkillBridge Backend Running ✅");
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));