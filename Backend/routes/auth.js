const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();
const SECRET = "jwt_secret"; // better store in .env
// Signup (student)
router.post("/signup", (req, res) => {
  const { full_name, roll_number, email, password, year, skills } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO users (full_name, roll_number, email, password, year, skills, role) VALUES (?, ?, ?, ?, ?, ?, 'student')",
    [full_name, roll_number, email, hashedPassword, year, skills],
    (err) => {
      if (err) return res.status(400).json({ error: err.sqlMessage });
      res.json({ message: "Signup successful" });
    }
  );
});
// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    const user = results[0];
    const validPassword = bcrypt.compareSync(password, user.password);
    const loginStatus = validPassword ? "success" : "failed";
     
    // 3. Insert login attempt into login_activity
    db.query(
      `INSERT INTO login_activity (user_id, ip_address, device_info, status)
       VALUES (?, ?, ?, ?)`,
      [
        user.id,                        // user_id from users table
        req.ip,                         // ip_address from request
        req.headers["user-agent"],      // device info (browser, OS)
        loginStatus                     // success or failed
      ],
      (err2) => {
        if (err2) console.error("Login activity insert error:", err2.sqlMessage);
      }
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );
   
      res.json({ message: "login successful",token,role:user.role});
  });
});

module.exports = router;
