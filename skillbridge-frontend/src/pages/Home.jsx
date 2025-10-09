import React from "react";

function Home() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #b71c1c, #d32f2f, #c62828, #880e4f)",
        backgroundSize: "400% 400%",
        animation: "redFlow 10s ease infinite",
        color: "#fff",
        padding: "5vw",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 4rem)",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          textShadow: "2px 2px 10px rgba(0,0,0,0.4)",
          borderBottom: "3px solid #ffffff88",
          paddingBottom: "0.5rem",
        }}
      >
        Welcome to SkillBridge
      </h1>

      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.4rem)",
          maxWidth: "90%",
          marginBottom: "2rem",
          lineHeight: "1.8",
          color: "#ffebee",
        }}
      >
        Your gateway to{" "}
        <strong style={{ color: "#ffffff" }}>Internships</strong> and{" "}
        <strong style={{ color: "#ffeaea" }}>Skill-Building Courses</strong>.  
        Helping students grow, achieve, and succeed 🚀.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <a
          href="/internships"
          style={{
            background: "#ffffff",
            color: "#b71c1c",
            padding: "1rem 2rem",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            transition: "0.3s",
            flex: "1 1 250px",
            textAlign: "center",
          }}
        >
          🌟 Explore Internships
        </a>

        <a
          href="/courses"
          style={{
            background: "#ffffff",
            color: "#880e4f",
            padding: "1rem 2rem",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            transition: "0.3s",
            flex: "1 1 250px",
            textAlign: "center",
          }}
        >
          🎓 Browse Courses
        </a>
      </div>
      <style>
        {`
          @keyframes redFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}
export default Home;