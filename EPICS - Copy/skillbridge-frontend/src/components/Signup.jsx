import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        full_name: fullName,
        roll_number: rollNumber,
        email,
        password
      });
      alert("Signup successful! Login now.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div
    style={{width:"100vw",height:"100vh"}}
    >
      <h2>Signup</h2>
      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} /><br />
      <input type="text" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} /><br />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;
