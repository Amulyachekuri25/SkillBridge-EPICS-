const mysql = require('mysql2/promise');
(async () => {
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'pass123', database: 'skillbridge' });
    const [cols] = await pool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_applications'");
    const existing = cols.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existing);
    const want = [
      { name: 'title', sql: "VARCHAR(255)" },
      { name: 'resume_url', sql: "VARCHAR(1024)" },
      { name: 'cover_letter', sql: "TEXT" }
    ];
    for (const c of want) {
      if (!existing.includes(c.name)) {
        console.log('Adding column', c.name);
        await pool.execute(`ALTER TABLE student_applications ADD COLUMN ${c.name} ${c.sql}`);
        console.log('Added', c.name);
      } else {
        console.log('Already has', c.name);
      }
    }
    const [cols2] = await pool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_applications'");
    console.log('Columns after:', cols2.map(r => r.COLUMN_NAME));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
