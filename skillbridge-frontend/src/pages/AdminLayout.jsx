import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./AdminLayout.css";
function AdminLayout() {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/manage-internships">Manage Internships</Link></li>
          <li><Link to="/admin/manage-students">Manage Students</Link></li>
          <li><Link to="/admin/reports">Reports</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
