// import React from "react";

// export default function Home() {
//   return (
//     <div className="container">
//       <div className="page-card">
//         <h2 className="section-header">Welcome to SkillBridge</h2>
//         <p style={{ color: "#35556c" }}>
//           Your personalized dashboard gives you quick access to internships,
//           curated courses, and progress insights. Explore below.
//         </p>
//       </div>

//       <div className="grid">
//         <div className="card-sm">
//           <h3>🎓 Recommended Courses</h3>
//           <p>AI & ML, Web Development, Data Analytics</p>
//           <button className="btn-primary" style={{ marginTop: 12 }}>View Courses</button>
//         </div>

//         <div className="card-sm">
//           <h3>💼 Internship Matches</h3>
//           <p>Companies aligned with your skill profile</p>
//           <button className="btn-primary" style={{ marginTop: 12 }}>Find Internships</button>
//         </div>

//         <div className="card-sm">
//           <h3>📈 Your Learning Stats</h3>
//           <p>Track enrolled courses, completion rate, and badges earned.</p>
//           <button className="btn-primary" style={{ marginTop: 12 }}>View Progress</button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="page-card">
        <h2 className="section-header">Welcome to SkillBridge</h2>
        <p style={{ color: "#35556c" }}>
          Your personalized dashboard gives you quick access to internships,
          curated courses, and progress insights. Explore below.
        </p>
      </div>

      <div className="grid">
        <div className="card-sm">
          <h3>🎓 Recommended Courses</h3>
          <p>AI & ML, Web Development, Data Analytics</p>
          <button className="btn-primary" style={{ marginTop: 12 }}
            onClick={() => navigate("/courses")}
          >
            View Courses
          </button>
        </div>
        <div className="card-sm">
          <h3>💼 Internship Matches</h3>
          <p>Companies aligned with your skill profile</p>
          <button className="btn-primary" style={{ marginTop: 12 }}
            onClick={() => navigate("/internships")}
          >
            Find Internships
          </button>
        </div>

        <div className="card-sm">
          <h3>📈 Your Learning Stats</h3>
          <p>Track enrolled courses, completion rate, and badges earned.</p>
          <button className="btn-primary" style={{ marginTop: 12 }}>
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
}
