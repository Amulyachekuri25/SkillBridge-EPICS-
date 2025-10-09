import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1); // ✅ Already fixed
  const [skills, setSkills] = useState(""); // ✅ New field

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        full_name: fullName,
        roll_number: rollNumber,
        email,
        password,
        year,
        skills
      });
      alert("Signup successful! Login now.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fff" }}>
        <h2 style={{ textAlign: "center" }}>Signup</h2>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Full Name:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Roll Number:</label>
          <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ width: "120px", display: "inline-block" }}>Skills:</label>
          <input
            type="text"
            placeholder="e.g. React, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={handleSignup} style={{ padding: "8px 16px", cursor: "pointer" }}>
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
