import React, { useState } from "react";
import API from "../axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful");
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-shell">
        <div className="auth-visual" aria-hidden>
          <h2>Welcome back</h2>
          <p>Enter your credentials to continue to your SkillBridge dashboard.</p>
          <div style={{ marginTop:18 }}>
            <div className="card">
              <strong>Tip:</strong> Use the same email you signed up with. Forgot password? Contact support.
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <small style={{ color:'#4b6b78' }}>New here? <a className="link" href="/signup">Create an account</a></small>
          </div>
        </div>

        <div className="form-card" role="form" aria-labelledby="login-heading">
          <h3 id="login-heading">Sign in</h3>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" />
          </div>

          <div className="helper-row">
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <input id="remember" type="checkbox" style={{ width:16, height:16 }} />
              <label htmlFor="remember" style={{ margin:0, fontWeight:600 }}>Remember me</label>
            </div>
            <div>
              <button className="btn-primary" onClick={handleLogin}>Sign in</button>
            </div>
          </div>

          <div className="footer-note">Need help? Contact support@skillbridge.com</div>
        </div>
      </div>
    </div>
  );
}
