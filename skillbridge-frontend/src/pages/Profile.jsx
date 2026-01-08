import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Fetch applications
      if (userData.id) {
        fetchApplications(userData.id);
        fetchCourses(userData.id);
      }
    }
  }, []);

  const fetchApplications = async (userId) => {
    setLoadingApps(true);
    try {
      const response = await axios.get(`/api/applications/user/${userId}`);
      setApplications(response.data || []);
      console.log("Applications fetched:", response.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchCourses = async (userId) => {
    setLoadingCourses(true);
    try {
      const response = await axios.get(`/api/courses/registrations/user/${userId}`);
      setCourses(response.data || []);
      console.log("Courses fetched:", response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "2rem", color: "#333", marginBottom: "30px" }}>Your Profile</h2>
      
      {/* User Info Card */}
      <div className="card" style={{ padding: "20px", maxWidth: "500px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
        <h3 style={{ color: "#0b67c2", marginTop: 0 }}>Personal Information</h3>
        <p><strong>Name:</strong> {user.full_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Roll Number:</strong> {user.roll_number}</p>
        <p><strong>Year:</strong> {user.year}</p>
        <p><strong>Skills:</strong> {user.skills || "Not Added"}</p>
      </div>

      {/* Applications Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ color: "#3730a3", fontSize: "1.5rem", marginBottom: "15px" }}>
          📝 Internship Applications ({applications.length})
        </h3>
        {loadingApps ? (
          <p>Loading applications...</p>
        ) : applications.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {applications.map((app, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  background: "#f0f4ff",
                  border: "1px solid #d0d9f5",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h4 style={{ color: "#3730a3", marginTop: 0, marginBottom: "10px" }}>
                  {app.internship_title || app.title}
                </h4>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Company:</strong> {app.company_name}
                </p>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "600" }}>{app.status}</span>
                </p>
                {app.applied_at && (
                  <p style={{ margin: "5px 0", color: "#888", fontSize: "0.9rem" }}>
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>No internship applications yet.</p>
        )}
      </div>

      {/* Courses Section */}
      <div>
        <h3 style={{ color: "#0b67c2", fontSize: "1.5rem", marginBottom: "15px" }}>
          📚 Course Enrollments ({courses.length})
        </h3>
        {loadingCourses ? (
          <p>Loading courses...</p>
        ) : courses.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {courses.map((course, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  background: "#f0f8ff",
                  border: "1px solid #b3d9ff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h4 style={{ color: "#0b67c2", marginTop: 0, marginBottom: "10px" }}>
                  {course.course_title}
                </h4>
                {course.skill && (
                  <p style={{ margin: "5px 0", color: "#555" }}>
                    <strong>Skill:</strong> {course.skill}
                  </p>
                )}
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "600" }}>{course.status}</span>
                </p>
                {course.registered_at && (
                  <p style={{ margin: "5px 0", color: "#888", fontSize: "0.9rem" }}>
                    Enrolled: {new Date(course.registered_at).toLocaleDateString()}
                  </p>
                )}
                {course.course_url && (
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "#0b67c2",
                      color: "white",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    View Course →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>No course enrollments yet.</p>
        )}
      </div>
    </div>
  );
}