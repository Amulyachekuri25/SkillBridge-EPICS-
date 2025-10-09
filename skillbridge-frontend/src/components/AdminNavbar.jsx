import React from "react";
import { Link } from "react-router-dom";

function AdminNavbar() {
  return (
    <nav style={{ background: "#b30000", padding: "15px", textAlign: "center" }}>
      <Link to="/admin" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Dashboard</Link>
      <Link to="/manage-internships" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Manage Internships</Link>
      <Link to="/manage-students" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Manage Students</Link>
      <Link to="/reports" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Reports</Link>
      
    </nav>
  );
}

export default AdminNavbar;
