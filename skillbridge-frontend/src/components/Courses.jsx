import React, { useState } from "react";

export default function Courses() {
  const [skill, setSkill] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!skill.trim()) {
      alert("Please enter a skill to search for courses.");
      return;
    }
    setSearched(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f3ff, #ffffff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          width: "85%",
          maxWidth: "1200px",
          padding: "60px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.6rem",
            fontWeight: "700",
            color: "#0b67c2",
            marginBottom: "30px",
          }}
        >
          Explore Courses
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "1.1rem",
            marginBottom: "50px",
          }}
        >
          Search for courses and certifications that align with your skill
          interests and career goals.
        </p>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
          }}
        >
          <label
            style={{
              fontWeight: "600",
              fontSize: "1.2rem",
              color: "#004080",
            }}
          >
            Enter a Skill You Want to Learn
          </label>

          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Data Science, Cloud Computing, Web Development"
            style={{
              width: "50%",
              padding: "14px 16px",
              fontSize: "1rem",
              borderRadius: "10px",
              border: "1px solid #c9d6de",
              outline: "none",
              background: "#f9fbfd",
              color: "#333",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "25px",
              background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
              color: "white",
              padding: "14px 40px",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(0, 111, 180, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Search Courses
          </button>
        </form>

        {searched && (
          <div style={{ marginTop: "50px" }}>
            <h3 style={{ color: "#0b67c2" }}>
              Showing results for: <i>{skill}</i>
            </h3>
            <p style={{ color: "#555", marginTop: "10px" }}>
              (Connect your backend or API here to display real course data.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
