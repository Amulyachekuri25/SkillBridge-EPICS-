const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();
const SECRET = "jwt_secret"; 
router.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM admin_signup WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (results.length === 0) return res.status(404).json({ error: "Admin not found" });
    const user = results[0];
    const validPassword = password==user.password?true:false;
    const loginStatus = validPassword ? "success" : "failed";
     
    // 3. Insert login attempt into login_activity
    db.query(
      `INSERT INTO admin_login_activity (user_id, ip_address, device_info, status)
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
