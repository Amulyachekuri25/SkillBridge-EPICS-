const mysql = require('mysql2/promise');
(async () => {
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'pass123', database: 'skillbridge' });
    const [cols] = await pool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_applications'");
    console.log('Columns before:', cols.map(r => r.COLUMN_NAME));
    const hasTitle = cols.some(r => r.COLUMN_NAME === 'title');
    if (!hasTitle) {
      console.log('Adding title column...');
      await pool.execute("ALTER TABLE student_applications ADD COLUMN title VARCHAR(255)");
      console.log('Added title column');
    } else {
      console.log('title already exists');
    }
    const [cols2] = await pool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_applications'");
    console.log('Columns after:', cols2.map(r => r.COLUMN_NAME));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
