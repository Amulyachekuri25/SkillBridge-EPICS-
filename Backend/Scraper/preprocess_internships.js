
const mysql = require("mysql2/promise");

// ---------- DATABASE CONNECTION ----------
async function cleanupInternships() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass123", // change if needed
    database: "skillbridge",
  });

  console.log("\n🧹 Internship Cleanup Started ...\n");

  // ---------------------------------------------------
  // 1️⃣ DELETE INTERNSHIPS WITH NO TITLE OR COMPANY
  // ---------------------------------------------------
  await conn.execute("DELETE FROM internships WHERE title IS NULL OR TRIM(title) = '' OR title='N/A'");
  await conn.execute("DELETE FROM internships WHERE company IS NULL OR TRIM(company) = '' OR company='N/A'");
  console.log("✅ Removed internships without title or company");
  // ---------------------------------------------------
  // 2️⃣ CHECK DEADLINES AND DELETE EXPIRED INTERNSHIPS
  // ---------------------------------------------------
  const [rows] = await conn.execute("SELECT id, deadline FROM internships WHERE deadline IS NOT NULL");

  const today = new Date();
  let deletedDeadlineCount = 0;

  for (const row of rows) {
    const internshipId = row.id;
    let internshipDeadline;
    try {
      internshipDeadline = new Date(row.deadline);

      // If deadline has passed → delete
      if (internshipDeadline < today) {
        await conn.execute("DELETE FROM internships WHERE id = ?", [internshipId]);
        deletedDeadlineCount++;
      }
    } catch (err) {
      // Invalid date format → delete for safety
      await conn.execute("DELETE FROM internships WHERE id = ?", [internshipId]);
      deletedDeadlineCount++;
    }
  }

  console.log(`✅ Removed outdated internships: ${deletedDeadlineCount}`);
  // ---------------------------------------------------
  // 3️⃣ REMOVE INTERNSHIPS WITH NO APPLY LINK
  // ---------------------------------------------------
  await conn.execute("DELETE FROM internships WHERE link IS NULL OR TRIM(link) = ''");
  console.log("✅ Removed internships with no apply link");
  console.log("\n🎯 Cleanup Completed Successfully!\n");

  await conn.end();
}

// Run cleanup
cleanupInternships().catch(err => console.error(err));
