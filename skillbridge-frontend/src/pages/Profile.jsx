import React, { useState } from "react";

export default function Profile() {
  // Dummy user data for now (later fetched from backend)
  const [user, setUser] = useState({
    name: "Hema Sri",
    email: "hema@example.com",
    roll: "22CS1234",
    year: "3rd Year",
    skills: "React, Node.js, MySQL",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditing(false);
    alert("Profile saved successfully!");
  };

  return (
    <div className="container">
      <div className="page-card">
        <h2 className="section-header">My Profile</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(145deg, #0b67c2, #00bfa5)",
              color: "white",
              borderRadius: "50%",
              width: 140,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "700",
              margin: "auto",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                name="roll"
                value={user.roll}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="text"
                name="year"
                value={user.year}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Skills</label>
              <input
                type="text"
                name="skills"
                value={user.skills}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>

            {!editing ? (
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
