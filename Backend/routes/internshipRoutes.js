// const express = require("express");
// const router = express.Router();
// const mysql = require("mysql2");
// const db = require("../db");
// router.get("/internships", (req, res) => {
//   const { year } = req.query;
//   if (!year) {
//     return res.status(400).json({ error: "Year parameter is required" });
//   }
//   // Query internships based on year
//   const sql = "SELECT title,company,skills,link FROM internships WHERE year = ?";
//   db.query(sql, [year], (err, results) => {
//     if (err) {
//       console.error("Error fetching internships:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     // Return internships for given year
//     res.json(results);
//   });
// });
// module.exports = router;
  // const express = require("express");
  // const router = express.Router();
  // const mysql = require("mysql2");
  // const db = require("../db");

  // router.get("/internships", (req, res) => {
  //   const { year } = req.query;

  //   if (!year) {
  //     return res.status(400).json({ error: "Year parameter is required" });
  //   }

  //   const sql = "SELECT title, company, skills, link FROM internships WHERE year = ?";

  //   db.query(sql, [year], (err, results) => {
  //     if (err) {
  //       console.error("Error fetching internships:", err);
  //       return res.status(500).json({ error: "Database error" });
  //     }

  //     // ✅ Filter out entries with title or company as "N/A"
  //     const filteredResults = results.filter(
  //       (item) => item.title !== "N/A" && item.company !== "N/A"
  //     );

  //     res.json(filteredResults);
  //   });
  // });

  // module.exports = router;
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const db = require("../db");

router.get("/internships", (req, res) => {
  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ error: "Year parameter is required" });
  }

  const sql = "SELECT title, company, skills, link FROM internships WHERE year = ?";

  db.query(sql, [year], (err, results) => {
    if (err) {
      console.error("Error fetching internships:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const cleanString = (value) => {
      if (!value) return "";
      return String(value).replace(/\s+/g, " ").trim().toUpperCase();
    };

    const filteredResults = results
      .filter((item) => {
        const title = cleanString(item.title);
        const company = cleanString(item.company);
        return title !== "N/A" && company !== "N/A" && title !== "" && company !== "";
      })
      .map((item) => {
        let skillsText = "Not specified";

        const skills = cleanString(item.skills);

        if (skills && skills !== "N/A" && skills !== "") {
          const skillsArray = skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s !== "N/A");
          if (skillsArray.length > 0) {
            skillsText = skillsArray.slice(0, 5).join(", ");
          }
        }

        return {
          ...item,
          skills: skillsText,
        };
      });

    res.json(filteredResults);
  });
});

module.exports = router;
