const mysql = require("mysql2");
const mysqlPromise = require("mysql2/promise");

// Regular connection for callback-based queries
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pass123",
  database: "skillbridge"
});

// Promise pool for async/await queries
const pool = mysqlPromise.createPool({
  host: "localhost",
  user: "root",
  password: "pass123",
  database: "skillbridge",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected...");
});

// Add execute method from pool to db for async/await support
db.execute = pool.execute.bind(pool);

module.exports = db;