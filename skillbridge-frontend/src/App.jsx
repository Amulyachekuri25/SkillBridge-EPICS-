import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Internships from "./components/Internships.jsx";
import Courses from "./components/Courses.jsx";

function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/courses" element={<Courses />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
