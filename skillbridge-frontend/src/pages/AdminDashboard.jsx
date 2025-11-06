import React from "react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Students", value: 1240 },
    { title: "Active Internships", value: 58 },
    { title: "Courses Indexed", value: 112 },
    { title: "Pending Reviews", value: 9 },
  ];

  return (
    <div>
      <h2
        style={{
          color: "#0b67c2",
          fontWeight: "700",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        Dashboard Overview
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "linear-gradient(135deg, #0b67c2, #00bfa5)",
              color: "white",
              borderRadius: "12px",
              padding: "25px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "10px" }}>{s.title}</h3>
            <p style={{ fontSize: "2rem", fontWeight: "700" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          padding: "30px",
        }}
      >
        <h3 style={{ color: "#0b67c2", marginBottom: "15px" }}>Recent Activity</h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f9ff" }}>
                <th style={{ padding: "10px 15px" }}>Date</th>
                <th style={{ padding: "10px 15px" }}>Action</th>
                <th style={{ padding: "10px 15px" }}>User</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px 15px" }}>Nov 2, 2025</td>
                <td style={{ padding: "10px 15px" }}>Added new internship - TechNova</td>
                <td style={{ padding: "10px 15px" }}>Admin01</td>
              </tr>
              <tr style={{ background: "#f9f9f9" }}>
                <td style={{ padding: "10px 15px" }}>Nov 1, 2025</td>
                <td style={{ padding: "10px 15px" }}>Approved 3 new students</td>
                <td style={{ padding: "10px 15px" }}>Admin02</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 15px" }}>Oct 31, 2025</td>
                <td style={{ padding: "10px 15px" }}>Updated course list</td>
                <td style={{ padding: "10px 15px" }}>Admin01</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
