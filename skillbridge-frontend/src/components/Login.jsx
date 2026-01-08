import React, { useState } from "react";
import API from "../axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  const handleLogin = async () => {
    // Validate email format
    if (!email || !emailPattern.test(email)) {
      setEmailError("Please enter a valid email format (e.g., user@example.com)");
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(`Password must contain: ${passwordErrors.join(", ")}`);
      return;
    }

    try {
      const res = await API.post("http://localhost:5000/api/auth/login", { email, password });
      
      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Store user ID and email separately for easy access
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("email", res.data.user.email);
      
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

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange} 
              placeholder="Your password"
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
              Strong password must contain: 8+ chars, uppercase, lowercase, number, special character
            </small>
          </div>

          <div className="helper-row">
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <input id="remember" type="checkbox" style={{ width:16, height:16 }} />
              <label htmlFor="remember" style={{ margin:0, fontWeight:600 }}>Remember me</label>
            </div>
            <div>
              <button 
                className="btn-primary" 
                onClick={handleLogin}
                disabled={emailError || passwordError}
                style={emailError || passwordError ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="footer-note">Need help? Contact support@skillbridge.com</div>
        </div>
      </div>
    </div>
  );
}
