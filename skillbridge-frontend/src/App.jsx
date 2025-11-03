import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminLogin from "./components/AdminLogin";
import Courses from "./components/Courses";
import Internships from "./components/Internships";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageStudents from "./pages/ManageStudents";
import ManageInternships from "./pages/ManageInternships";
import Reports from "./pages/Reports";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/contact";
import Profile from "./pages/Profile";

export default function App() {
  // Check if student or admin is logged in
  const isLoggedIn = !!localStorage.getItem("token");
  const isAdmin = !!localStorage.getItem("adminToken");

  return (
    <>
      {/* Navbar visible on all public and student pages */}
      <Navbar />

      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

        {/* ---------- Authentication Routes ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* ---------- Student Routes ---------- */}
        <Route
          path="/courses"
          element={isLoggedIn ? <Courses /> : <Navigate to="/login" />}
        />
        <Route
          path="/internships"
          element={isLoggedIn ? <Internships /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />

        {/* ---------- Admin Routes ---------- */}
        <Route
          path="/admin/*"
          element={isAdmin ? <AdminLayout /> : <Navigate to="/adminlogin" />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="internships" element={<ManageInternships />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* ---------- Fallback Route ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
