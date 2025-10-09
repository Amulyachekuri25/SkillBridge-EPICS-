import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Internships from "./components/Internships";
import Courses from "./components/Courses";
import AdminLogin from "./components/AdminLogin";
// Admin Pages
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageInternships from "./pages/ManageInternships";
import ManageStudents from "./pages/ManageStudents";
import Reports from "./pages/Reports";

function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          {/* Admin Routes inside layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="manage-internships" element={<ManageInternships />} />
            <Route path="manage-students" element={<ManageStudents />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
