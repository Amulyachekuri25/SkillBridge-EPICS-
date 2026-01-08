const mysql = require("mysql2/promise");

async function preprocessInternships() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass123",
    database: "skillbridge",
  });

  console.log("\n🧹 Internship Cleanup Started ...\n");

  await conn.execute("DELETE FROM internships WHERE title IS NULL OR TRIM(title) = '' OR title='N/A'");
  await conn.execute("DELETE FROM internships WHERE company IS NULL OR TRIM(company) = '' OR company='N/A'");
  console.log("✅ Removed internships without title or company");

  const [rows] = await conn.execute("SELECT id, deadline FROM internships WHERE deadline IS NOT NULL");
  const today = new Date();
  let deletedDeadlineCount = 0;

  for (const row of rows) {
    const internshipDeadline = new Date(row.deadline);

    if (isNaN(internshipDeadline) || internshipDeadline < today) {
      await conn.execute("DELETE FROM internships WHERE id = ?", [row.id]);
      deletedDeadlineCount++;
    }
  }

  console.log(`✅ Removed outdated internships: ${deletedDeadlineCount}`);

  await conn.execute("DELETE FROM internships WHERE link IS NULL OR TRIM(link) = ''");
  console.log("✅ Removed internships with no apply link");

  console.log("\n🎯 Cleanup Completed Successfully!\n");
  await conn.end();
}

module.exports = { preprocessInternships }; // ✅ EXPORT IT
