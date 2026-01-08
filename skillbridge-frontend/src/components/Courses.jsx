import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Courses() {
  const [skill, setSkill] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showEnrollmentConfirmation, setShowEnrollmentConfirmation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [wasOpened, setWasOpened] = useState(false);

  const API_URL = "http://localhost:5000/api/courses";

  // Fetch available skills for autocomplete
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`/api/courses/skills`);
        setSuggestions(response.data.skills || []);
      } catch (err) {
        console.log("Could not fetch skills suggestions");
      }
    };
    fetchSkills();
  }, []);

  // Detect when user returns from opened link
  useEffect(() => {
    const handleFocus = () => {
      if (wasOpened && searched) {
        setShowEnrollmentConfirmation(true);
        setWasOpened(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [wasOpened, searched]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!skill.trim()) {
      setError("Please enter a skill to search for courses.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await axios.get(`/api/courses/search`, {
        params: { skill: skill.trim() },
        timeout: 120000, // 2 minute timeout for scraping
      });

      if (response.data.courses && response.data.courses.length > 0) {
        setCourses(response.data.courses);
        setError("");
      } else {
        setCourses([]);
        setError(response.data.message || `🔍 Searching for courses... Please wait for a minute.`);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
      
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. The scraper is taking longer than expected. Please try again.");
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.details ||
          "Error fetching courses. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle course enrollment button click - show confirmation dialog
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setWasOpened(true);
    // Open the course link in a new tab
    window.open(course.url, '_blank');
  };

  // Handle enrollment confirmation
  const handleConfirmEnrollment = async (enrolled) => {
    if (!selectedCourse) return;

    setShowEnrollmentConfirmation(false);

    if (enrolled) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;

      if (!userId) {
        alert("Please log in to enroll in courses");
        setSelectedCourse(null);
        return;
      }

      try {
        const payload = {
          userId,
          courseTitle: selectedCourse.title,
          skill: skill,
          courseUrl: selectedCourse.url,
          enrollmentDate: new Date().toISOString().split('T')[0],
        };

        console.log("Sending course enrollment payload:", payload);

        const response = await axios.post("/api/courses/verify-enrollment", payload);
        
        console.log("Enrollment response:", response.data);
        alert("✅ Course enrollment added to your profile!");
      } catch (err) {
        console.error("Error saving enrollment:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response?.data);
        const errorMsg = err.response?.data?.error || err.message || "Failed to save enrollment";
        alert(`❌ ${errorMsg}`);
      }
    }
    setSelectedCourse(null);
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
            list="skillSuggestions"
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
          <datalist id="skillSuggestions">
            {suggestions.map((sug, index) => (
              <option key={index} value={sug} />
            ))}
          </datalist>

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
          <div style={{ marginTop: "50px", textAlign: "left" }}>
            {loading && (
              <div style={{ textAlign: "center", color: "#0b67c2" }}>
                <p style={{ fontSize: "1.1rem" }}>
                  🔄 Searching for courses... <br />
                  <small style={{ fontSize: "0.9rem", color: "#666" }}>
                    If no results exist, the system is automatically scraping from Coursera. This may take a minute...
                  </small>
                </p>
              </div>
            )}

            {!loading && error && (
              <div
                style={{
                  padding: "20px",
                  background: "#ffe6e6",
                  borderLeft: "4px solid #ff4444",
                  borderRadius: "8px",
                  color: "#cc0000",
                }}
              >
                <p style={{ margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            {!loading && courses.length > 0 && (
              <div>
                <h3
                  style={{
                    color: "#0b67c2",
                    marginBottom: "20px",
                    fontSize: "1.4rem",
                  }}
                >
                  ✅ Found {courses.length} courses for "{skill}"
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {courses.map((course, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#f9fbfd",
                        border: "1px solid #e0e6ed",
                        borderRadius: "12px",
                        padding: "20px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(0, 0, 0, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <h4
                        style={{
                          color: "#0b67c2",
                          marginTop: 0,
                          marginBottom: "10px",
                          fontSize: "1.1rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {course.title}
                      </h4>

                      <p style={{ margin: "8px 0", color: "#555" }}>
                        <strong>Provider:</strong> {course.source}
                      </p>

                      <p style={{ margin: "8px 0", color: "#555" }}>
                        <strong>Price:</strong>{" "}
                        <span
                          style={{
                            color: course.price === "Free" ? "#00b050" : "#d9534f",
                            fontWeight: "600",
                          }}
                        >
                          {course.price}
                        </span>
                      </p>

                      <p style={{ margin: "8px 0", color: "#555" }}>
                        <strong>Enrolled:</strong> {course.enrolled}
                      </p>

                      <button
                        onClick={() => handleEnrollClick(course)}
                        style={{
                          display: "inline-block",
                          marginTop: "15px",
                          padding: "10px 16px",
                          background: "linear-gradient(90deg, #0b67c2, #00bfa5)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "opacity 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.target.style.opacity = "1")}
                      >
                        Enroll Now →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && searched && courses.length === 0 && !error && (
              <div
                style={{
                  padding: "20px",
                  background: "#e6f2ff",
                  border: "1px solid #b3d9ff",
                  borderRadius: "8px",
                  color: "#0b67c2",
              }}
              >
                <p style={{ margin: 0 }}>
                  ℹ️ No courses found in database for "{skill}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enrollment Confirmation Modal */}
        {showEnrollmentConfirmation && selectedCourse && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "#0b67c2",
                  marginTop: 0,
                  marginBottom: "15px",
                  fontSize: "1.3rem",
                }}
              >
                📚 Did you enroll in this course?
              </h3>
              <p style={{ color: "#555", marginBottom: "10px" }}>
                <strong>{selectedCourse.title}</strong>
              </p>
              <p style={{ color: "#666", marginBottom: "25px" }}>
                We'll add it to your profile.
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => handleConfirmEnrollment(false)}
                  style={{
                    padding: "10px 24px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  No
                </button>
                <button
                  onClick={() => handleConfirmEnrollment(true)}
                  style={{
                    padding: "10px 24px",
                    background: "#0b67c2",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ✅ Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
