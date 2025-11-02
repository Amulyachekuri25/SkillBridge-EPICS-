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
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("userType", "admin");
      alert("Login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0b67c2, #00bfa5)",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "40px 50px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          width: "380px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#0b67c2",
            marginBottom: "30px",
            fontWeight: "700",
          }}
        >
          Admin Login
        </h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>
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
                border: "1px solid #c9d6de",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #c9d6de",
                outline: "none",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{
                background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
                color: "white",
                fontWeight: "600",
                padding: "10px 28px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "opacity 0.3s ease",
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
