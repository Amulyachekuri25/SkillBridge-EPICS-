// import React, { useState } from "react";
// import API from "../axiosConfig";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const res = await API.post("/auth/login", { email, password });

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       alert("Login successful");
//       navigate("/home");
//     } catch (err) {
//       alert(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="container auth-shell">
//         <div className="auth-visual" aria-hidden>
//           <h2>Welcome back</h2>
//           <p>Enter your credentials to continue to your SkillBridge dashboard.</p>
//           <div style={{ marginTop:18 }}>
//             <div className="card">
//               <strong>Tip:</strong> Use the same email you signed up with. Forgot password? Contact support.
//             </div>
//           </div>
//           <div style={{ marginTop:16 }}>
//             <small style={{ color:'#4b6b78' }}>New here? <a className="link" href="/signup">Create an account</a></small>
//           </div>
//         </div>

//         <div className="form-card" role="form" aria-labelledby="login-heading">
//           <h3 id="login-heading">Sign in</h3>

//           <div className="form-group">
//             <label>Email</label>
//             <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" />
//           </div>

//           <div className="helper-row">
//             <div style={{ display:'flex', gap:12, alignItems:'center' }}>
//               <input id="remember" type="checkbox" style={{ width:16, height:16 }} />
//               <label htmlFor="remember" style={{ margin:0, fontWeight:600 }}>Remember me</label>
//             </div>
//             <div>
//               <button className="btn-primary" onClick={handleLogin}>Sign in</button>
//             </div>
//           </div>

//           <div className="footer-note">Need help? Contact support@skillbridge.com</div>
//         </div>
//       </div>
//     </div>
//   );
// }
          // import React from "react";
          // import { useNavigate, Link } from "react-router-dom";

          // export default function Navbar() {
          //   const navigate = useNavigate();
          //   const user = JSON.parse(localStorage.getItem("user"));

          //   const handleLogout = () => {
          //     localStorage.removeItem("token");
          //     localStorage.removeItem("user");
          //     navigate("/login");
          //   };

          //   return (
          //     <nav className="navbar">
          //       <div className="logo">SkillBridge</div>

          //       <div className="nav-links">
          //         <Link to="/home">Home</Link>
          //         <Link to="/profile">Profile</Link>
          //         <Link to="/internships">Internships</Link>
          //         <Link to="/courses">Courses</Link>
          //       </div>

          //       <div className="nav-right">
          //         {user && <span className="user-info">{user.name || user.email}</span>}
          //         <button className="btn-logout" onClick={handleLogout}>
          //           Logout
          //         </button>
          //       </div>
          //     </nav>
          //   );
          // }
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <>
      {/* Navbar JSX */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">SkillBridge</Link>
        </div>

        <div className="nav-right">
          {/* Public Links */}
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/contact">Contact</Link>

          {/* Student Logged In */}
          {userToken && (
            <>
              <Link to="/home">Dashboard</Link>
              <Link to="/internships">Internships</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}

          {/* Admin Logged In */}
          {adminToken && (
            <>
              <Link to="/admin/dashboard">Admin Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}

          {/* Not Logged In */}
          {!userToken && !adminToken && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
              <Link to="/adminlogin">Admin Login</Link>
            </>
          )}
        </div>
      </nav>

      {/* Inline CSS */}
      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f8f8;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .nav-left .brand {
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
          color: #333;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px; /* Space between items */
        }

        .nav-right a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
        }

        .nav-right a:hover {
          color: #007bff;
        }

        .logout-btn {
          padding: 5px 12px;
          border: none;
          background-color: #ff4d4d;
          color: white;
          border-radius: 5px;
          cursor: pointer;
        }

        .logout-btn:hover {
          background-color: #e60000;
        }
      `}</style>
    </>
  );
}
