// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// // Components
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import AdminLogin from "./components/AdminLogin";
// import Courses from "./components/Courses";
// import Internships from "./components/Internships";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Pages
// import Landing from "./pages/Landing";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import FAQ from "./pages/FAQ";
// import Contact from "./pages/contact";
// import Profile from "./pages/Profile";

// // Admin Pages
// import AdminLayout from "./pages/AdminLayout";
// import AdminDashboard from "./pages/AdminDashboard";
// import ManageStudents from "./pages/ManageStudents";
// import ManageInternships from "./pages/ManageInternships";
// import Reports from "./pages/Reports";

// export default function App() {
//   const isAdmin = !!localStorage.getItem("adminToken");

//   return (
//     <>
//       <Navbar />

//       <Routes>
//         {/* ---------- Public Routes ---------- */}
//         <Route path="/" element={<Landing />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/faq" element={<FAQ />} />
//         <Route path="/contact" element={<Contact />} />

//         {/* ---------- Authentication ---------- */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/adminlogin" element={<AdminLogin />} />

//         {/* ---------- Student Protected Routes ---------- */}
//         <Route
//           path="/courses"
//           element={
//             <ProtectedRoute>
//               <Courses />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/internships"
//           element={
//             <ProtectedRoute>
//               <Internships />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />

//         {/* ---------- Admin Protected Routes ---------- */}
//         <Route
//           path="/admin/*"
//           element={isAdmin ? <AdminLayout /> : <Navigate to="/adminlogin" />}
//         >
//           <Route index element={<Navigate to="dashboard" replace />} />
//           <Route path="dashboard" element={<AdminDashboard />} />
//           <Route path="students" element={<ManageStudents />} />
//           <Route path="internships" element={<ManageInternships />} />
//           <Route path="reports" element={<Reports />} />
//         </Route>

//         {/* ---------- Default Fallback ---------- */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </>
//   );
// }
// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // import Login from "./pages/Login";
// // import Signup from "./pages/Signup";
// // import Home from "./pages/Home";
// // import Profile from "./pages/Profile";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Courses from "./components/Courses";
import Internships from "./components/Internships";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";

// Admin Pages


export default function App() {

  return (
    <BrowserRouter>
      {/* Navbar is always visible */}
      <Navbar />

      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />

        {/* ---------- Auth Routes ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        

        {/* ---------- Student Protected Routes ---------- */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internships"
          element={
            <ProtectedRoute>
              <Internships />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        
        {/* ---------- Fallback Route ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
