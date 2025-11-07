// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Profile() {
//   const [data, setData] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/profile", {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//       })
//       .then((res) => setData(res.data))
//       .catch(() => navigate("/login"));
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   if (!data) return <h3 style={{ textAlign: "center", marginTop: 40 }}>Loading...</h3>;

//   const { profile, internshipsApplied, coursesEnrolled } = data;

//   return (
//     <div className="container">
//       <div className="page-card">
//         <h2>Your Profile</h2>
//       </div>

//       <div className="profile-box">
//         <p><strong>Name:</strong> {profile.full_name}</p>
//         <p><strong>Roll No:</strong> {profile.roll_number || "Not Provided"}</p>
//         <p><strong>Email:</strong> {profile.email}</p>
//         <p><strong>Year:</strong> {profile.year}</p>
//         <p><strong>Skills:</strong> {profile.skills || "Not Added Yet"}</p>

//         <hr />

//         <p><strong>Internships Applied:</strong> {internshipsApplied}</p>
//         <p><strong>Courses Enrolled:</strong> {coursesEnrolled}</p>

//         <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleLogout}>
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Your Profile</h2>
      <div className="card" style={{ padding: "20px", maxWidth: "400px" }}>
        <p><strong>Name:</strong> {user.full_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Roll Number:</strong> {user.roll_number}</p>
        <p><strong>Year:</strong> {user.year}</p>
        <p><strong>Skills:</strong> {user.skills || "Not Added"}</p>
      </div>
    </div>
  );
}
