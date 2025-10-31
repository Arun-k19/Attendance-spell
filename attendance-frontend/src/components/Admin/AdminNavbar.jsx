import React from "react";

export default function AdminNavbar({ now }) {
  // offcanvas target id must match AdminSidebar's id
  return (
    <header
      className="d-flex align-items-center justify-content-between px-3 py-2"
      style={{
        background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)",
        color: "white",
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {/* mobile toggle for offcanvas sidebar */}
        <button
          className="btn btn-outline-light d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
          aria-label="Open sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            className="bi bi-list"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2.5 12.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>

        <div className="ms-1">
          <h5 className="mb-0">Welcome, Admin</h5>
          <small className="text-white-50">Attendance Management System</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="px-3 py-2 bg-white rounded text-dark small">
          {now.toLocaleDateString()} {now.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
