import React, { useState } from "react";
import API from "../axiosConfig";
import axios from "axios";
function Internships() {
  const [year, setYear] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInternships, setShowInternships] = useState(false);

  // Fetch internships based on year
 const fetchInternships = async () => {
  if (!year) return;
  setLoading(true);
  setError("");
  try {
    const res = await axios.get(`http://localhost:5000/api/internships?year=${year}`);
    setData(res.data);
    setShowInternships(true);
  } catch (err) {
    setError("⚠️ Failed to fetch internships. Please try again.");
  } finally {
    setLoading(false);
  }
};


  // -------------------------------
  // STEP 1: YEAR SELECTION SCREEN (unchanged)
  // -------------------------------
  if (!showInternships) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to bottom right, #e0e7ff, #bfdbfe)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#4338ca",
            marginBottom: "30px",
          }}
        >
          🎓 Internship Opportunities
        </h1>

        <div
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "40px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "90%",
            maxWidth: "400px",
          }}
        >
          <label
            style={{
              fontSize: "18px",
              color: "#374151",
              fontWeight: "500",
              marginBottom: "10px",
              display: "block",
            }}
          >
            Select Your Year:
          </label>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #c7d2fe",
              fontSize: "16px",
              marginBottom: "20px",
            }}
          >
            <option value="">-- Choose Year --</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <button
            onClick={fetchInternships}
            disabled={!year}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: year ? "#4f46e5" : "#9ca3af",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: year ? "pointer" : "not-allowed",
              transition: "background 0.3s ease",
            }}
          >
            View Internships
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------
  // STEP 2: INTERNSHIP DISPLAY SCREEN (UI upgraded)
  // -------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ff, #a5b4fc 90%)",
        padding: "3rem 1rem",
      }}
    >
      <button
        onClick={() => setShowInternships(false)}
        style={{
          display: "inline-block",
          marginBottom: "1.5rem",
          backgroundColor: "#6366f1",
          color: "white",
          padding: "0.7rem 2rem",
          borderRadius: "10px",
          border: "none",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 4px 18px #6366f140",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseOver={e => (e.target.style.backgroundColor = "#4f46e5")}
        onMouseOut={e => (e.target.style.backgroundColor = "#6366f1")}
      >
        ⬅ Back
      </button>

      <h2
        style={{
          fontSize: "2.2rem",
          fontWeight: "bold",
          color: "#3730a3",
          textAlign: "center",
          marginBottom: "2.5rem",
          letterSpacing: "2px",
        }}
      >
        <span
          style={{
            background: "linear-gradient(90deg, #6366f1 30%, #818cf8 100%)",
            color: "white",
            borderRadius: "12px",
            padding: "0.3rem 1.2rem",
            fontSize: "1.1rem",
            marginRight: "0.7rem",
            boxShadow: "0 2px 10px #6366f15a",
            verticalAlign: "middle",
          }}
        >
          {year} Year
        </span>
        Internships
      </h2>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180 }}>
          <div className="spinner" style={{
            border: "5px solid #b6ccfb",
            borderTop: "5px solid #4f46e5",
            borderRadius: "50%",
            width: 60, height: 60,
            animation: "spin 1s linear infinite",
            marginRight: 16,
          }}></div>
          <span style={{ fontSize: 20, color: "#475569" }}>⏳ Loading internships...</span>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "#dc2626", fontSize: "1.16rem", fontWeight: 500 }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: "2rem",
          marginTop: "3rem",
        }}
      >
        {!loading && data.length > 0 ? (
          data.map((i, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "2px solid #dbeafe",
                borderRadius: "25px",
                boxShadow: "0 4px 28px #6366f120",
                padding: "2rem",
                backdropFilter: "blur(5px)",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
                outline: "2.5px solid #a5b4fc",
                outlineOffset: "5px",
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = "0 8px 40px #6366f19a";
                e.currentTarget.style.transform = "scale(1.027)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = "0 4px 28px #6366f120";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <h3
                style={{
                  fontSize: "1.48rem",
                  fontWeight: "600",
                  color: "#3730a3",
                  marginBottom: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  letterSpacing: ".5px",
                }}
              >
                <span role="img" aria-label="opportunity" style={{ fontSize: "1.3em" }}>💼</span>
                {i.title}
              </h3>
              <p style={{ color: "#373737", fontWeight: "500", margin: "0.8rem 0 0.1rem 0" }}>
                <span style={{
                  color: "#6366f1",
                  fontWeight: 700,
                  marginRight: "0.25rem",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}>🏢 Company:</span>
                {i.company}
              </p>
              {i.skills && (
                <p style={{ color: "#64748b", fontSize: "1rem", margin: "0.1rem 0 0.8rem 0" }}>
                  <span
                    style={{
                      color: "#818cf8",
                      fontWeight: "600",
                      marginRight: "0.3rem",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}>🛠 Skills:</span>
                  {i.skills}
                </p>
              )}

              <a
                href={i.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.85rem 0",
                  background: "linear-gradient(90deg,#6366f1 20%,#818cf8 100%)",
                  color: "white",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1.13rem",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px #818cf880",
                  transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
                  textDecoration: "none",
                  letterSpacing: ".07em",
                  outline: "none",
                  cursor: "pointer",
                }}
                onMouseOver={e => { e.target.style.background = "linear-gradient(90deg,#3730a3 0%, #6366f1 80%)"; e.target.style.transform = "scale(1.035)"; }}
                onMouseOut={e => { e.target.style.background = "linear-gradient(90deg,#6366f1 20%,#818cf8 100%)"; e.target.style.transform = "scale(1)"; }}
              >
                🔗 View Internship
              </a>
            </div>
          ))
        ) : (
          !loading && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", fontSize: "1.2rem" }}>
              <span style={{ display: "block", margin: "0 auto 1.5rem", width: 60, height: 60 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#c7d2fe" />
                  <path d="M17 29c.7-2 3.2-3 7-3s6.3 1 7 3" stroke="#3730a3" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="18.5" cy="21" rx="2" ry="2.5" fill="#6366f1" />
                  <ellipse cx="29.5" cy="21" rx="2" ry="2.5" fill="#6366f1" />
                </svg>
              </span>
              😕 No internships found for this year.
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Internships;
