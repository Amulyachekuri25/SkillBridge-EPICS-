// const express = require("express");
// const router = express.Router();
// const db = require("../config/db"); // your MySQL connection file
// const verifyToken = require("../middleware/auth"); // middleware that verifies JWT

// router.get("/profile", verifyToken, (req, res) => {
//   const userId = req.user.id; // user id extracted from token

//   const userQuery = `SELECT full_name, roll_number, email, year, skills FROM users WHERE id = ?`;
//   const internshipsCountQuery = `SELECT COUNT(*) AS internshipsCount FROM internships_applied WHERE user_id = ?`;
//   const coursesCountQuery = `SELECT COUNT(*) AS coursesCount FROM courses_enrolled WHERE user_id = ?`;

//   db.query(userQuery, [userId], (err, userResult) => {
//     if (err) return res.status(500).json({ error: err });

//     db.query(internshipsCountQuery, [userId], (err, intResult) => {
//       if (err) return res.status(500).json({ error: err });

//       db.query(coursesCountQuery, [userId], (err, courseResult) => {
//         if (err) return res.status(500).json({ error: err });

//         return res.json({
//           profile: userResult[0],
//           internshipsApplied: intResult[0].internshipsCount,
//           coursesEnrolled: courseResult[0].coursesCount
//         });
//       });
//     });
//   });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Get student profile
router.get("/profile", verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `SELECT full_name, roll_number, email, year, skills FROM users WHERE id = ?`;

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(result[0]);
  });
});

module.exports = router;
