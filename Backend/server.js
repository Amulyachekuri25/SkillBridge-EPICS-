const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const authRoutes = require("./routes/auth");
//const internshipRoutes = require("./routes/internships");
//const courseRoutes = require("./routes/courses");
const adminRoutes = require("./routes/admin");
const app = express();
app.use(cors());
app.use(bodyParser.json());
// Routes
app.use("/api/auth", authRoutes);
//app.use("/api/internships", internshipRoutes);
//app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));