const express = require("express");
const router = express.Router();
const db = require("../db");
const { spawn } = require("child_process");
const path = require("path");

/**
 * Create student course registrations table if it doesn't exist
 */
const createCourseRegistrationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS student_course_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT,
      course_title VARCHAR(255) NOT NULL,
      skill VARCHAR(255),
      course_url VARCHAR(500),
      status ENUM('registered', 'in_progress', 'completed', 'dropped') DEFAULT 'registered',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_registered_at (registered_at)
    )
  `;
  try {
    await db.execute(query);
    console.log("[OK] student_course_registrations table ready");
  } catch (err) {
    console.error("[ERROR] Failed to create course registrations table:", err.message);
  }
};

// Initialize table on route load
createCourseRegistrationsTable();

/**
 * Helper function to run the Python scraper
 */
function runPythonScraper(skill) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../Scraper/coursera_scraper.py");
    // Try multiple python executables for Windows compatibility
    const pythonCandidates = [process.env.PYTHON || "python", "py", "python3"];

    let lastError = null;

    const trySpawn = (candidates) => {
      if (candidates.length === 0) {
        return reject(new Error("No Python executable available: " + (lastError ? lastError.message : "")));
      }

      const exe = candidates[0];
      const python = spawn(exe, [scriptPath, skill], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
        console.log(`[Scraper] ${data.toString()}`);
      });

      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error(`[Scraper Error] ${data.toString()}`);
      });

      python.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          lastError = new Error(`Scraper failed with code ${code}: ${errorOutput}`);
          // try next candidate
          trySpawn(candidates.slice(1));
        }
      });

      python.on("error", (err) => {
        lastError = err;
        // try next candidate
        trySpawn(candidates.slice(1));
      });
    };

    trySpawn(pythonCandidates);
  });
}

/**
 * GET /api/courses/search?skill=python
 * Search for courses by skill
 * First checks database, if not found, automatically scrapes
 */
router.get("/search", async (req, res) => {
  const { skill } = req.query;

  if (!skill || skill.trim() === "") {
    return res.status(400).json({ error: "Skill parameter is required" });
  }

  const skillTrim = skill.trim();

  // Query the skill_courses table
  const query = "SELECT * FROM skill_courses WHERE LOWER(skill) = LOWER(?) ORDER BY created_at DESC";

  db.query(query, [skillTrim], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (results.length > 0) {
      // Courses found in database
      return res.status(200).json({
        source: "database",
        skill: skillTrim,
        count: results.length,
        courses: results,
      });
    }

    // No courses found in database - automatically run scraper
    try {
      console.log(`\n🔄 No courses found for "${skillTrim}". Starting automatic scraper...`);
      await runPythonScraper(skillTrim);

      // Wait a moment for database to be updated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fetch newly scraped courses from database
      db.query(query, [skillTrim], (err2, newResults) => {
        if (err2) {
          console.error("❌ Database error after scraping:", err2);
          return res.status(500).json({
            error: "Database error after scraping",
            details: err2.message,
          });
        }

        if (newResults.length > 0) {
          return res.status(200).json({
            source: "scraped",
            skill: skillTrim,
            count: newResults.length,
            message: `✅ Successfully scraped ${newResults.length} courses for "${skillTrim}"`,
            courses: newResults,
          });
        } else {
          return res.status(404).json({
            source: "not_found",
            skill: skillTrim,
            message: `No courses found for "${skillTrim}" even after scraping. The skill may not be available on Coursera.`,
            courses: [],
          });
        }
      });
    } catch (scraperError) {
      console.error("❌ Scraper error:", scraperError.message);
      return res.status(500).json({
        source: "scraper_error",
        skill: skillTrim,
        error: "Automatic scraping failed",
        details: scraperError.message,
        courses: [],
      });
    }
  });
});

/**
 * GET /api/courses/all
 * Get all courses from database (optional, for admin)
 */
router.get("/all", (req, res) => {
  const query = "SELECT * FROM skill_courses ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    res.status(200).json({
      count: results.length,
      courses: results,
    });
  });
});

/**
 * GET /api/courses/skills
 * Get all unique skills in database
 */
router.get("/skills", (req, res) => {
  const query = "SELECT DISTINCT skill FROM skill_courses ORDER BY skill ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    const skills = results.map((row) => row.skill);
    res.status(200).json({
      count: skills.length,
      skills: skills,
    });
  });
});

/**
 * POST /api/courses/register
 * Register a user for a course (adds to dashboard)
 */
router.post("/register", async (req, res) => {
  console.log("[DEBUG] /register endpoint hit");
  console.log("[DEBUG] Request body:", req.body);
  
  try {
    const { userId, courseTitle, skill, courseUrl } = req.body;

    if (!userId || !courseTitle) {
      console.error("[ERROR] Missing fields - userId:", userId, "courseTitle:", courseTitle);
      return res.status(400).json({ error: "Missing required fields: userId, courseTitle" });
    }

    // Validate and convert userId to integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt) || userIdInt <= 0) {
      console.error("[ERROR] Invalid userId:", userId);
      return res.status(400).json({ error: "Invalid userId - must be a positive number" });
    }

    // Check if already registered
    const checkQuery = `SELECT id FROM student_course_registrations WHERE user_id = ? AND course_title = ?`;
    console.log("[LOG] Checking existing registrations...");
    const [existing] = await db.execute(checkQuery, [userIdInt, courseTitle]);

    if (existing && existing.length > 0) {
      console.log("[INFO] User already registered for this course:", courseTitle);
      return res.status(400).json({ error: "Already registered for this course" });
    }

    // Insert course registration
    const query = `
      INSERT INTO student_course_registrations (user_id, course_title, skill, course_url)
      VALUES (?, ?, ?, ?)
    `;

    console.log("[LOG] Executing insert with:", { userIdInt, courseTitle, skill, courseUrl });
    const result = await db.execute(query, [userIdInt, courseTitle, skill || null, courseUrl || null]);
    console.log("[LOG] Insert result - Affected rows:", result[0].affectedRows);

    res.json({ message: "Course registration successful", status: "registered" });
  } catch (err) {
    console.error("[ERROR] Course registration error:", err);
    console.error("[ERROR] Error stack:", err.stack);
    res.status(500).json({ error: err && err.message ? err.message : "Failed to register for course" });
  }
});

/**
 * GET /api/courses/user/:userId
 * Get all enrolled courses for a user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT id, course_title, skill, course_url, status, registered_at, updated_at 
      FROM student_course_registrations 
      WHERE user_id = ? 
      ORDER BY registered_at DESC
    `;

    const [courses] = await db.execute(query, [userId]);
    res.json(courses || []);
  } catch (err) {
    console.error("[ERROR] Fetch user courses error:", err.message);
    res.status(500).json({ error: "Failed to fetch user courses" });
  }
});

/**
 * POST /api/courses/verify-enrollment
 * User confirms they enrolled in a course (e.g., on Coursera, Udemy)
 * Frontend asks: "Did you enroll in this course?" → Yes → Add to profile
 */
router.post("/verify-enrollment", async (req, res) => {
  try {
    const { userId, courseTitle, skill, courseUrl, enrollmentProof } = req.body;

    if (!userId || !courseTitle) {
      return res.status(400).json({ error: "Missing required fields: userId, courseTitle" });
    }

    // Check if already exists
    const checkQuery = `SELECT id FROM student_course_registrations WHERE user_id = ? AND course_title = ?`;
    const [existing] = await db.execute(checkQuery, [userId, courseTitle]);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Already registered for this course" });
    }

    // Insert with enrollment proof (optional screenshot/certificate)
    const query = `
      INSERT INTO student_course_registrations (user_id, course_title, skill, course_url, status)
      VALUES (?, ?, ?, ?, 'in_progress')
    `;

    const [result] = await db.execute(query, [userId, courseTitle, skill || null, courseUrl || null]);

    res.json({ 
      message: "Course enrollment verified and added to your profile", 
      status: "in_progress",
      registrationId: result.insertId,
      proof: enrollmentProof || null
    });
  } catch (err) {
    console.error("[ERROR] Course verification error:", err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : "Failed to verify course enrollment" });
  }
});

/**
 * GET /api/courses/registrations/user/:userId
 * Fetch all course registrations for a user (dashboard)
 */
router.get("/registrations/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("[INFO] Fetching course registrations for user:", userId);

    const query = `SELECT id, course_title, skill, course_url, status, registered_at FROM student_course_registrations WHERE user_id = ? ORDER BY registered_at DESC`;
    const [registrations] = await db.execute(query, [userId]);

    console.log("[INFO] Found registrations:", registrations ? registrations.length : 0);
    res.json(registrations || []);
  } catch (err) {
    console.error("[ERROR] Fetch registrations error:", err.message);
    res.status(500).json({ error: "Failed to fetch course registrations" });
  }
});

/**
 * GET /api/courses/registrations/:registrationId
 * Fetch single course registration by ID
 */
router.get("/registrations/:registrationId", async (req, res) => {
  try {
    const { registrationId } = req.params;

    const query = `SELECT * FROM student_course_registrations WHERE id = ?`;
    const [registration] = await db.execute(query, [registrationId]);

    if (!registration || registration.length === 0) {
      return res.status(404).json({ error: "Course registration not found" });
    }

    res.json(registration[0]);
  } catch (err) {
    console.error("[ERROR] Fetch registration error:", err.message);
    res.status(500).json({ error: "Failed to fetch course registration" });
  }
});

/**
 * PATCH /api/courses/registrations/:registrationId/status
 * Update course registration status (in_progress, completed, dropped)
 */
router.patch("/registrations/:registrationId/status", async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['registered', 'in_progress', 'completed', 'dropped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = `UPDATE student_course_registrations SET status = ? WHERE id = ?`;
    await db.execute(query, [status, registrationId]);

    res.json({ message: "Course registration status updated", status });
  } catch (err) {
    console.error("[ERROR] Update status error:", err.message);
    res.status(500).json({ error: "Failed to update course registration status" });
  }
});

/**
 * DELETE /api/courses/registrations/:registrationId
 * Remove a course registration from user profile
 */
router.delete("/registrations/:registrationId", async (req, res) => {
  try {
    const { registrationId } = req.params;

    const query = `DELETE FROM student_course_registrations WHERE id = ?`;
    const [result] = await db.execute(query, [registrationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course registration not found" });
    }

    res.json({ message: "Course registration removed successfully" });
  } catch (err) {
    console.error("[ERROR] Delete registration error:", err.message);
    res.status(500).json({ error: "Failed to delete course registration" });
  }
});

module.exports = router;
