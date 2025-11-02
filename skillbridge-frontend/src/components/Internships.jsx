import React from "react";

export default function Internships() {
  const internships = [
    {
      company: "TechNova",
      role: "Frontend Developer",
      type: "Remote",
      duration: "2 months",
    },
    {
      company: "DataNest",
      role: "Data Analyst Intern",
      type: "On-site",
      duration: "3 months",
    },
    {
      company: "HealthAI",
      role: "ML Research Intern",
      type: "Remote",
      duration: "6 months",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b67c2, #00bfa5)",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "40px 60px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          width: "90%",
          maxWidth: "1100px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#0b67c2",
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "40px",
          }}
        >
          Available Internships
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
          }}
        >
          {internships.map((intern, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                borderRadius: "15px",
                padding: "25px 20px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(0, 0, 0, 0.08)";
              }}
            >
              <h3
                style={{
                  color: "#0b67c2",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                {intern.role}
              </h3>
              <p style={{ fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                {intern.company}
              </p>
              <p style={{ color: "#5b7684", marginBottom: "18px" }}>
                {intern.type} • {intern.duration}
              </p>
              <button
                style={{
                  background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
