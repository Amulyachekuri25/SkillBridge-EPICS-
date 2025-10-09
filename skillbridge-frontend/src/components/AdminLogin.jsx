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
      // ✅ Ensure only admins can login
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        navigate("/admin"); // redirect to admin dashboard
     
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", textAlign: "center", marginTop: "50px" }}>
      <h2>Admin Login</h2>
      <div>
        <label>Email: </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <br />
      <div>
        <label>Password: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;
