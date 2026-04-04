import React from "react";

export default function AdminNavbar({ now }) {
  return (
    <header
      className="d-flex align-items-center justify-content-between px-3 py-2"
      style={{
        background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)",
        color: "white",
      }}
    >
      <div className="d-flex align-items-center gap-3">

        {/* Mobile Sidebar Toggle */}
        <button
          className="btn btn-outline-light d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <div className="ms-1">
          <h5 className="mb-0">Welcome, Admin</h5>
          <small className="text-white-50">
            Attendance Management System
          </small>
        </div>

      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="px-3 py-2 bg-white rounded text-dark small">
          {now?.toLocaleDateString()} {now?.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}