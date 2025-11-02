import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminLogin from "./components/AdminLogin";
import Home from "./pages/Home";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/contact";
import Courses from "./components/Courses";
import Internships from "./components/Internships";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageStudents from "./pages/ManageStudents";
import ManageInternships from "./pages/ManageInternships";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";


export default function App() {
  const isLoggedIn = !!localStorage.getItem("token");
  const isAdmin = !!localStorage.getItem("adminToken");

  return (
    <>
      <Navbar />
      <Routes>
        {/* ---------- Public Pages ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        



        {/* ---------- Private Student Pages ---------- */}
        <Route
          path="/courses"
          element={isLoggedIn ? <Courses /> : <Navigate to="/login" />}
        />
        <Route
          path="/internships"
          element={isLoggedIn ? <Internships /> : <Navigate to="/login" />}
        />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}/>

        {/* ---------- Admin Pages ---------- */}
        <Route
          path="/admin/*"
          element={isAdmin ? <AdminLayout /> : <Navigate to="/adminlogin" />}
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="internships" element={<ManageInternships />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </>
  );
}
