import React from "react";

export default function Reports() {
  const reports = [
    { name: "Monthly Student Signup Report", date: "Oct 2025" },
    { name: "Internship Approval Summary", date: "Oct 2025" },
    { name: "Course Engagement Trends", date: "Sept 2025" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ color: "#0b67c2", fontWeight: "700", textAlign: "center", marginBottom: "30px" }}>
        Reports
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
        }}
      >
        {reports.map((r, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px 20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          >
            <h3 style={{ color: "#0b67c2", fontWeight: "700", marginBottom: "8px" }}>{r.name}</h3>
            <p style={{ color: "#5b7684", marginBottom: "16px" }}>Generated on: {r.date}</p>
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
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
