import React, { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "Student",
  });

  useEffect(() => {
    // Later this can come from backend API
    const storedName = localStorage.getItem("userName") || "Your Name";
    const storedEmail = localStorage.getItem("userEmail") || "yourmail@example.com";
    setUser({ name: storedName, email: storedEmail, role: "Student" });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // In future: send this data to backend via API
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);
    alert("Profile updated successfully!");
  };

  return (
    <div className="container">
      <div className="page-card" style={{ maxWidth: "600px", margin: "40px auto" }}>
        <h2 className="section-header" style={{ textAlign: "center" }}>My Profile</h2>

        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Role:</label>
          <input
            type="text"
            value={user.role}
            disabled
            className="form-control"
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
