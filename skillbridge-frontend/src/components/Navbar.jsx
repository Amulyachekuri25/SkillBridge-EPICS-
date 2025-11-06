import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowRoleSelect(true);
  };

  const handleRoleSelect = (role) => {
    setShowRoleSelect(false);
    if (role === "student") navigate("/login");
    else if (role === "admin") navigate("/adminlogin");
  };

  return (
    <>
      <nav className="navbar">
        <h2 className="logo">SkillBridge</h2>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <a href="#" onClick={handleLoginClick}>Login</a>
          <Link to="/profile">Profile</Link>
        </div>
      </nav>

      {/* ✨ Modern role selection modal */}
      {showRoleSelect && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.3s ease-in-out",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, #0b67c2 0%, #00bfa5 100%)",
              padding: "35px 50px",
              borderRadius: "18px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              textAlign: "center",
              color: "#fff",
              width: "320px",
              animation: "scaleIn 0.3s ease-in-out",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Select Your Role</h2>
            <p style={{ fontSize: "14px", marginBottom: "25px", opacity: 0.9 }}>
              Please choose your role to continue
            </p>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => handleRoleSelect("student")}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0b67c2",
                  fontWeight: "600",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1,
                  marginRight: "10px",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#e1f5fe")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
              >
                Student
              </button>

              <button
                onClick={() => handleRoleSelect("admin")}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#00bfa5",
                  fontWeight: "600",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1,
                  marginLeft: "10px",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#e0f7f4")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
              >
                Admin
              </button>
            </div>

            <button
              onClick={() => setShowRoleSelect(false)}
              style={{
                marginTop: "20px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "8px",
                padding: "8px 20px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.3)")}
              onMouseOut={(e) => (e.target.style.background = "rgba(255,255,255,0.2)")}
            >
              Cancel
            </button>
          </div>

          {/* ✨ Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
