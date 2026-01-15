import React from "react";

export default function ManageInternships() {
  const internships = [
    { company: "TechNova", role: "Frontend Developer", status: "Approved" },
    { company: "DataNest", role: "Data Analyst", status: "Pending" },
    { company: "HealthAI", role: "ML Intern", status: "Approved" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ color: "#0b67c2", fontWeight: "700", textAlign: "center", marginBottom: "30px" }}>
        Manage Internships
      </h2>
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
          }}
        >
          <thead style={{ background: "linear-gradient(90deg, #0b67c2, #00bfa5)", color: "white" }}>
            <tr>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Company</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Role</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((i, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e9f6fb")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = idx % 2 === 0 ? "#f9f9f9" : "#ffffff")
                }
              >
                <td style={{ padding: "12px 20px" }}>{i.company}</td>
                <td style={{ padding: "12px 20px" }}>{i.role}</td>
                <td style={{ padding: "12px 20px", fontWeight: "600" }}>
                  <span
                    style={{
                      color: i.status === "Approved" ? "#00bfa5" : "#d47f2a",
                    }}
                  >
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
