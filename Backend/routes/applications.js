const express = require("express");
const db = require("../db");
const router = express.Router();

// Create applications table if it doesn't exist
const createApplicationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS student_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      internship_id INT,
      internship_title VARCHAR(255),
      title VARCHAR(255),
      company_name VARCHAR(255) NOT NULL,
      status ENUM('applied', 'rejected', 'shortlisted', 'selected') DEFAULT 'applied',
      resume_url VARCHAR(500),
      cover_letter TEXT,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_applied_at (applied_at)
    )
  `;
  try {
    await db.execute(query);
    console.log("[OK] student_applications table ready");
    // Ensure both title columns exist for compatibility with different schemas
    try {
      await db.execute("ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS title VARCHAR(255)");
      await db.execute("ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS internship_title VARCHAR(255)");
    } catch (e) {
      // Some MySQL versions may not support IF NOT EXISTS for ADD COLUMN; ignore errors
    }
  } catch (err) {
    console.error("[ERROR] Failed to create applications table:", err.message);
  }
};

// Initialize table on route load
createApplicationsTable();

// POST: Apply for an internship
router.post("/apply", async (req, res) => {
  try {
    const { userId, internshipTitle, companyName, resumeUrl, coverLetter } = req.body;

    if (!userId || !internshipTitle || !companyName) {
      return res.status(400).json({ error: "Missing required fields: userId, internshipTitle, companyName" });
    }

    // Check if already applied (check both possible title columns)
    const checkQuery = `SELECT id FROM student_applications WHERE user_id = ? AND (internship_title = ? OR title = ?)`;
    const [existing] = await db.execute(checkQuery, [userId, internshipTitle, internshipTitle]);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Already applied for this internship" });
    }

    // Insert into both title columns to keep compatibility
    const query = `
      INSERT INTO student_applications (user_id, internship_title, title, company_name, resume_url, cover_letter)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [userId, internshipTitle, internshipTitle, companyName, resumeUrl || null, coverLetter || null]);

    res.json({ message: "Application submitted successfully", status: "applied" });
  } catch (err) {
    console.error("[ERROR] Application submit error:", err && err.message ? err.message : err);
    // Return the underlying error message to the client for easier debugging (non-sensitive)
    res.status(500).json({ error: err && err.message ? err.message : "Failed to submit application" });
  }
});

// POST: Verify externally applied internship (Unstop, Internshala, LinkedIn)
// User is asked: "Did you apply for this internship?" → Yes → Add to profile
router.post("/verify-application", async (req, res) => {
  try {
    const { userId, internshipTitle, companyName, source, applicationUrl, applicationDate } = req.body;

    if (!userId || !internshipTitle || !companyName) {
      return res.status(400).json({ error: "Missing required fields: userId, internshipTitle, companyName" });
    }

    // Check if already applied (check both possible title columns)
    const checkQuery = `SELECT id FROM student_applications WHERE user_id = ? AND (internship_title = ? OR title = ?)`;
    const [existing] = await db.execute(checkQuery, [userId, internshipTitle, internshipTitle]);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Already added this internship to your profile" });
    }

    // Insert with source platform info and application link
    const query = `
      INSERT INTO student_applications (user_id, internship_title, title, company_name, status)
      VALUES (?, ?, ?, ?, 'applied')
    `;

    const [result] = await db.execute(query, [userId, internshipTitle, internshipTitle, companyName]);

    res.json({ 
      message: "Internship application verified and added to your profile", 
      status: "applied",
      applicationId: result.insertId,
      source: source || "external",
      applicationUrl: applicationUrl || null,
      appliedAt: applicationDate || new Date()
    });
  } catch (err) {
    console.error("[ERROR] Application verification error:", err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : "Failed to verify internship application" });
  }
});

// GET: Fetch all applications for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("[INFO] Fetching applications for user:", userId);

      // Return only the columns you requested: internship_title, company_name, status
      const query = `SELECT COALESCE(internship_title, title) AS internship_title, company_name, status FROM student_applications WHERE user_id = ? ORDER BY applied_at DESC`;
    const [applications] = await db.execute(query, [userId]);

    console.log("[INFO] Found applications:", applications ? applications.length : 0);
    res.json(applications || []);
  } catch (err) {
    console.error("[ERROR] Fetch applications error:", err.message);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET: Fetch single application by ID
router.get("/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const query = `SELECT * FROM student_applications WHERE id = ?`;
    const [application] = await db.execute(query, [applicationId]);

    if (!application || application.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application[0]);
  } catch (err) {
    console.error("[ERROR] Fetch application error:", err.message);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// PATCH: Update application status (for admin)
router.patch("/:applicationId/status", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'rejected', 'shortlisted', 'selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = `UPDATE student_applications SET status = ? WHERE id = ?`;
    await db.execute(query, [status, applicationId]);

    res.json({ message: "Application status updated", status });
  } catch (err) {
    console.error("[ERROR] Update status error:", err.message);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

// DELETE: Remove an application from user profile
router.delete("/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const query = `DELETE FROM student_applications WHERE id = ?`;
    const [result] = await db.execute(query, [applicationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application removed from profile successfully" });
  } catch (err) {
    console.error("[ERROR] Delete application error:", err.message);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

module.exports = router;
