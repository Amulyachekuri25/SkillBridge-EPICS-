import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/admin/adminlogin", {
        email,
        password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("userType", "admin");
        navigate("/admin/dashboard");
      } else {
        alert("Invalid response from server");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f7fbff, #e8f2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          display: "flex",
          width: "850px",
          overflow: "hidden",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0b67c2, #00bfa5)",
            color: "white",
            padding: "50px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "20px" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: "1rem", opacity: 0.9, lineHeight: 1.5 }}>
            Enter your credentials to continue to your <b>SkillBridge Admin Dashboard</b>.
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "15px",
              marginTop: "25px",
              fontSize: "0.9rem",
              backdropFilter: "blur(4px)",
            }}
          >
            <b>Tip:</b> Use your official admin email address to log in.  
            Need help? Contact system support.
          </div>

          <p style={{ marginTop: "30px", fontSize: "0.9rem" }}>
            Not an admin? Go back to <a href="/" style={{ color: "#fff", fontWeight: "600" }}>Home</a>
          </p>
        </div>

        {/* Right Section */}
        <div
          style={{
            flex: 1,
            padding: "50px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontWeight: "700", color: "#0b2545", marginBottom: "20px" }}>Admin Sign In</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                  color: "#0b2545",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cdd7e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                  color: "#0b2545",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cdd7e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "25px",
              }}
            >
              <label style={{ fontSize: "0.9rem", color: "#555" }}>
                <input type="checkbox" style={{ marginRight: "6px" }} /> Remember me
              </label>
              <a
                href="#"
                style={{
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  color: "#0b67c2",
                  fontWeight: "600",
                }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
                color: "#fff",
                fontWeight: "600",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "0.3s",
              }}
              onMouseOver={(e) =>
                (e.target.style.boxShadow = "0 4px 15px rgba(0,191,165,0.4)")
              }
              onMouseOut={(e) => (e.target.style.boxShadow = "none")}
            >
              Sign in
            </button>
          </form>

          <p
            style={{
              marginTop: "25px",
              fontSize: "0.9rem",
              color: "#555",
              textAlign: "center",
            }}
          >
            Need help? Contact <b>support@skillbridge.com</b>
          </p>
        </div>
      </div>
    </div>
  );
}
