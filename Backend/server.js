require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const internshipRoutes = require("./Routes/internshipRoutes");
const adminRoutes = require("./routes/admin");
const runScraperJob = require("./Jobs/schedular");
// Initialize Express App
const app = express();
// ✅ Enable CORS for Vite frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
// ✅ Middleware MUST come before routes
app.use(express.json());
app.use(bodyParser.json());
runScraperJob();
// ✅ Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", internshipRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("SkillBridge Backend Running ✅");
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
