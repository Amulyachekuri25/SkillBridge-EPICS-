import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userType");
    navigate("/adminlogin");
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    margin: "0 18px",
    transition: "all 0.3s ease",
    letterSpacing: "0.4px",
  };

  const navStyle = {
    background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const navLeft = {
    display: "flex",
    alignItems: "center",
  };

  const navRight = {
    display: "flex",
    alignItems: "center",
  };

  const buttonStyle = {
    background: "white",
    color: "#0b67c2",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  return (
    <nav style={navStyle}>
      <div style={navLeft}>
        <Link to="/admin/dashboard" style={linkStyle}>
          Dashboard
        </Link>
        <Link to="/admin/internships" style={linkStyle}>
          Manage Internships
        </Link>
        <Link to="/admin/students" style={linkStyle}>
          Manage Students
        </Link>
        <Link to="/admin/reports" style={linkStyle}>
          Reports
        </Link>
      </div>

      <div style={navRight}>
        <button
          style={buttonStyle}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.85)")
          }
          onMouseLeave={(e) => (e.target.style.background = "white")}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
