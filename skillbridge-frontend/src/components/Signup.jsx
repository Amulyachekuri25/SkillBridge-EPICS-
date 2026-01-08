import React, { useState } from "react";
import API from "../axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1);
  const [skills, setSkills] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [rollNumberError, setRollNumberError] = useState("");
  const navigate = useNavigate();

  // Email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password strength validation
  const validatePassword = (pass) => {
    const errors = [];
    if (pass.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push("one uppercase letter (A-Z)");
    }
    if (!/[a-z]/.test(pass)) {
      errors.push("one lowercase letter (a-z)");
    }
    if (!/[0-9]/.test(pass)) {
      errors.push("one number (0-9)");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
      errors.push("one special character (!@#$%^&*...)");
    }
    return errors;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailPattern.test(value)) {
      setEmailError("Please enter a valid email format (e.g., user@example.com)");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      const errors = validatePassword(value);
      if (errors.length > 0) {
        setPasswordError(`Password must contain: ${errors.join(", ")}`);
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (!value.trim()) {
      setFullNameError("Full name is required");
    } else {
      setFullNameError("");
    }
  };

  const handleRollNumberChange = (e) => {
    const value = e.target.value;
    setRollNumber(value);
    if (!value.trim()) {
      setRollNumberError("Roll number is required");
    } else {
      setRollNumberError("");
    }
  };

  const handleSignup = async () => {
    try {
      // Validation for all required fields
      const errors = [];

      if (!fullName.trim()) {
        setFullNameError("Full name is required");
        errors.push("Full name");
      } else {
        setFullNameError("");
      }

      if (!rollNumber.trim()) {
        setRollNumberError("Roll number is required");
        errors.push("Roll number");
      } else {
        setRollNumberError("");
      }

      if (!email) {
        setEmailError("Email is required");
        errors.push("Email");
      } else if (!emailPattern.test(email)) {
        setEmailError("Please enter a valid email format (e.g., user@example.com)");
        errors.push("Email");
      } else {
        setEmailError("");
      }

      if (!password) {
        setPasswordError("Password is required");
        errors.push("Password");
      } else {
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          setPasswordError(`Password must contain: ${passwordErrors.join(", ")}`);
          errors.push("Password");
        } else {
          setPasswordError("");
        }
      }

      // If there are any errors, show which fields are missing
      if (errors.length > 0) {
        alert(`Please fill the following required fields:\n\n• ${errors.join("\n• ")}`);
        return;
      }

      await API.post("http://localhost:5000/api/auth/signup", {
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
            <input 
              value={fullName} 
              onChange={handleFullNameChange} 
              placeholder="Your full name"
              style={fullNameError ? { borderColor: '#dc3545' } : {}}
            />
            {fullNameError && (
              <div style={{ color: '#dc3545', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ marginTop: 2 }}>⚠️</span>
                <span>{fullNameError}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Roll number</label>
            <input 
              value={rollNumber} 
              onChange={handleRollNumberChange} 
              placeholder="e.g. 21BCE0001"
              style={rollNumberError ? { borderColor: '#dc3545' } : {}}
            />
            {rollNumberError && (
              <div style={{ color: '#dc3545', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ marginTop: 2 }}>⚠️</span>
                <span>{rollNumberError}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={handleEmailChange} 
              placeholder="you@example.com"
              autoComplete="off"
              style={emailError ? { borderColor: '#dc3545' } : {}}
            />
            {emailError && (
              <div style={{ color: '#dc3545', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ marginTop: 2 }}>⚠️</span>
                <span>{emailError}</span>
              </div>
            )}
            <small style={{ color: '#6c757d', display: 'block', marginTop: 6 }}>
              Pattern: user@example.com
            </small>
          </div>

          <div className="form-row">
            <div style={{ flex:1 }}>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={handlePasswordChange} 
                  placeholder="Choose a strong password"
                  autoComplete="off"
                  style={passwordError ? { borderColor: '#dc3545' } : {}}
                />
                {passwordError && (
                  <div style={{ color: '#dc3545', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ marginTop: 2 }}>⚠️</span>
                    <span>{passwordError}</span>
                  </div>
                )}
                <small style={{ color: '#6c757d', display: 'block', marginTop: 6 }}>
                  Must contain: 8+ chars, uppercase, lowercase, number, special character
                </small>
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
              <button 
                className="btn-primary" 
                onClick={handleSignup}
                disabled={emailError || passwordError || fullNameError || rollNumberError}
                style={emailError || passwordError || fullNameError || rollNumberError ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                Create account
              </button>
            </div>
          </div>

          <div className="footer-note">We protect your data. No spam. No sharing.</div>
        </div>
      </div>
    </div>
  );
}
