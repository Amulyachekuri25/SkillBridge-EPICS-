import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav style={{ padding: "20px", backgroundColor: "#1E90FF", color: "white"}}>
      <Link to="/" style={{ margin: "10px", color: "white" }}>Home</Link>
      <Link to="/about" style={{ margin: "10px", color: "white" }}>About</Link>
      <Link to="/contact" style={{ margin: "10px", color: "white" }}>Contact</Link>
      <Link to="/faq" style={{ margin: "10px", color: "white" }}>FAQ</Link>
      <Link to="/internships" style={{ margin: "10px", color: "white" }}>Internships</Link>
      <Link to="/courses" style={{ margin: "10px", color: "white" }}>Courses</Link>
      <Link to="/login" style={{ margin: "10px", color: "white" }}>Login</Link>
      <Link to="/signup" style={{ margin: "10px", color: "white" }}>Signup</Link>
      <Link to="/adminlogin" style={{ margin: "10px", color: "white "}}>Admin</Link>
    </nav>
  );
}
export default Navbar;
