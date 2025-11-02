import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/adminlogin", {
        email,
        password
      });
      // Store admin token
      localStorage.setItem("adminToken", res.data.token); 
      // Set user type
      localStorage.setItem("userType", "admin"); 
      alert("Login successful!");
      navigate("/admin"); // redirect to admin dashboard
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="form-card">
        <h2 style={{ textAlign: "center", color: '#880E4F' }}>Admin Login</h2>
        <div className="form-group">
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {/* Use a different shade for the Admin login button */}
            <button 
                onClick={handleLogin} 
                className="primary-button" 
                style={{ backgroundColor: '#880E4F' }}
            >
                Login
            </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
