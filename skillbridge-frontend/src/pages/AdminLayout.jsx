import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>SkillBridge Admin</h2>
        <nav>
          <Link
            to="/admin/dashboard"
            className={current === "/admin/dashboard" ? "active" : ""}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/students"
            className={current === "/admin/students" ? "active" : ""}
          >
            👥 Manage Students
          </Link>
          <Link
            to="/admin/internships"
            className={current === "/admin/internships" ? "active" : ""}
          >
            💼 Manage Internships
          </Link>
          <Link
            to="/admin/reports"
            className={current === "/admin/reports" ? "active" : ""}
          >
            📈 Reports
          </Link>
        </nav>
      </aside>

      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
