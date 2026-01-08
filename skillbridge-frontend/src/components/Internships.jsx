import React, { useState, useEffect } from "react";
import axios from "axios";

function Internships() {
  const [year, setYear] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInternships, setShowInternships] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);

  // Fetch internships
  const fetchInternships = async () => {
    if (!year) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`/api/internships?year=${year}`);
      setData(res.data);
      setShowInternships(true);
    } catch (err) {
      setError("⚠️ Failed to fetch internships. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Detect when user returns from opened link
  useEffect(() => {
    const handleFocus = () => {
      if (wasOpened && showInternships) {
        setShowApplyDialog(true);
        setWasOpened(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [wasOpened, showInternships]);

  // Handle opening internship link
  const handleOpenInternship = (internship) => {
    setSelectedInternship(internship);
    setWasOpened(true);
    window.open(internship.link, "_blank");
  };

  // Handle apply confirmation
  const handleApplyConfirmation = async (didApply) => {
    if (didApply && selectedInternship) {
      setDialogLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id;

        if (!userId) {
          alert("Please log in to save your application");
          setShowApplyDialog(false);
          return;
        }

        const payload = {
          userId,
          internshipTitle: selectedInternship.title,
          companyName: selectedInternship.company,
          source: "Unstop",
          applicationUrl: selectedInternship.link,
          applicationDate: new Date().toISOString().split('T')[0],
        };

        console.log("Sending payload:", payload);

        const response = await axios.post("/api/applications/verify-application", payload);
        
        console.log("Response:", response.data);
        alert("✅ Internship application added to your profile!");
      } catch (err) {
        console.error("Error saving application:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response?.data);
        const errorMsg = err.response?.data?.error || err.message || "Failed to save application";
        alert(`❌ ${errorMsg}`);
      } finally {
        setDialogLoading(false);
        setShowApplyDialog(false);
      }
    } else {
      setShowApplyDialog(false);
    }
  };

  // -----------------------------------------
  // STEP 1: SELECT YEAR SCREEN
  // -----------------------------------------
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

  // -----------------------------------------
  // STEP 2: SHOW INTERNSHIP CARDS
  // -----------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ff, #a5b4fc 90%)",
        padding: "3rem 1rem",
      }}
    >
      {/* Back Button */}
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
        }}
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
          }}
        >
          {year} Year
        </span>
        Internships
      </h2>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
          ⏳ Loading internships...
        </p>
      )}

      {/* Error */}
      {error && (
        <p style={{ textAlign: "center", color: "red", fontSize: "1.2rem" }}>
          {error}
        </p>
      )}

      {/* Internship Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        {!loading &&
          data.length > 0 &&
          data.map((i, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "1.5rem",
                boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
                transition: "0.2s",
              }}
            >
              <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#3730a3" }}>
                💼 {i.title}
              </h3>

              <p style={{ color: "#444", fontWeight: 500 }}>
                🏢 Company: {i.company}
              </p>

              <p style={{ color: "#666", marginBottom: "1rem" }}>
                🛠 Skills: {i.skills}
              </p>

              {/* View Link */}
              <a
                href={i.link}
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenInternship(i);
                }}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "0.8rem",
                  background: "#6366f1",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🔗 View Internship
              </a>
            </div>
          ))}
      </div>

      {/* Apply Confirmation Dialog */}
      {showApplyDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ fontSize: "1.5rem", color: "#3730a3", marginBottom: "1rem" }}>
              Did you apply for this internship?
            </h3>
            <p style={{ color: "#666", marginBottom: "2rem" }}>
              {selectedInternship?.title}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => handleApplyConfirmation(false)}
                disabled={dialogLoading}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                No
              </button>
              <button
                onClick={() => handleApplyConfirmation(true)}
                disabled={dialogLoading}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem",
                  opacity: dialogLoading ? 0.6 : 1,
                }}
              >
                {dialogLoading ? "Saving..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internships;