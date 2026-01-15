import React from "react";

export default function About() {
  return (
    <div className="container">
      <div className="page-card">
        <h2 className="section-header">About SkillBridge</h2>
        <p style={{ color: "#37566c", fontSize: "1.05rem" }}>
          SkillBridge is a student-focused platform that bridges academic
          learning and industry expectations. Our AI-powered recommendation
          system connects you with relevant internships and top-rated
          certification courses.
        </p>
      </div>

      <div className="grid">
        <div className="card-sm">
          <h3>🎯 Mission</h3>
          <p>Empower every learner to find meaningful internships and skills.</p>
        </div>
        <div className="card-sm">
          <h3>🌐 Vision</h3>
          <p>To become the most trusted skill-matching platform for students worldwide.</p>
        </div>
        <div className="card-sm">
          <h3>🤝 Values</h3>
          <p>Transparency, Growth, Curiosity, and Collaboration.</p>
        </div>
      </div>
    </div>
  );
}
