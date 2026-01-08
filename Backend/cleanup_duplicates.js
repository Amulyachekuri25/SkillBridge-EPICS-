const mysql = require('mysql2/promise');

async function cleanup() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'skillbridge',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();

    // Step 1: Show all applications before cleanup
    const [before] = await conn.execute('SELECT * FROM student_applications ORDER BY user_id, internship_title');
    console.log('\n=== BEFORE CLEANUP ===');
    console.log('Total applications:', before.length);
    before.forEach(app => {
      console.log(`  ID: ${app.id}, User: ${app.user_id}, Title: ${app.internship_title}`);
    });

    // Step 2: Delete duplicates keeping only the first one
    const deleteQuery = `DELETE FROM student_applications 
      WHERE id NOT IN (
        SELECT MIN(id) FROM (
          SELECT id FROM student_applications
        ) AS t
        GROUP BY user_id, internship_title
      )`;

    const [result] = await conn.execute(deleteQuery);
    console.log('\n=== CLEANUP ===');
    console.log('Deleted duplicate entries:', result.affectedRows);

    // Step 3: Add unique constraint
    try {
      await conn.execute('ALTER TABLE student_applications ADD UNIQUE KEY unique_user_internship (user_id, internship_title)');
      console.log('Unique constraint added successfully');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('Unique constraint already exists');
      } else {
        throw e;
      }
    }

    // Step 4: Show applications after cleanup
    const [after] = await conn.execute('SELECT * FROM student_applications ORDER BY user_id, internship_title');
    console.log('\n=== AFTER CLEANUP ===');
    console.log('Total applications:', after.length);
    after.forEach(app => {
      console.log(`  ID: ${app.id}, User: ${app.user_id}, Title: ${app.internship_title}`);
    });

    conn.release();
    await pool.end();
    console.log('\n✅ Cleanup completed successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

cleanup();
