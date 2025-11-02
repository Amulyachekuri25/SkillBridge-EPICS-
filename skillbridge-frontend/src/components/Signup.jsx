import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1);
  const [skills, setSkills] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // Basic client-side validation
      if (!fullName || !email || !password) {
        alert("Please fill name, email and password.");
        return;
      }
      await axios.post("http://localhost:5000/api/auth/signup", {
        full_name: fullName,
        roll_number: rollNumber,
        email,
        password,
        year,
        skills
      });
      alert("Signup successful! Redirecting to login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-shell">
        <div className="auth-visual" aria-hidden>
          <h2>Welcome to SkillBridge</h2>
          <p>Create your account and discover internships and high-value courses matched to you.</p>
          <div style={{ marginTop:18 }}>
            <ul style={{ margin:0, paddingLeft:18, color:'#265a78' }}>
              <li>Personalized internship matching</li>
              <li>Verified opportunities</li>
              <li>Skills-based course ranking</li>
            </ul>
          </div>
          <div style={{ marginTop:16 }}>
            <small style={{ color:'#4b6b78' }}>Already have an account? <a className="link" href="/login">Sign in</a></small>
          </div>
        </div>

        <div className="form-card" role="form" aria-labelledby="signup-heading">
          <h3 id="signup-heading">Create account</h3>

          <div className="form-group">
            <label>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          <div className="form-group">
            <label>Roll number</label>
            <input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. 21BCE0001" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="form-row">
            <div style={{ flex:1 }}>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a strong password" />
              </div>
            </div>
            <div style={{ width:120 }}>
              <div className="form-group">
                <label>Year</label>
                <select value={year} onChange={e=>setYear(Number(e.target.value))}>
                  <option value={1}>1st</option>
                  <option value={2}>2nd</option>
                  <option value={3}>3rd</option>
                  <option value={4}>4th</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Python, ML" />
          </div>

          <div className="helper-row">
            <div style={{ color:'#5f7b89', fontSize:14 }}>By signing up you agree to the platform terms.</div>
            <div>
              <button className="btn-primary" onClick={handleSignup}>Create account</button>
            </div>
          </div>

          <div className="footer-note">We protect your data. No spam. No sharing.</div>
        </div>
      </div>
    </div>
  );
}
