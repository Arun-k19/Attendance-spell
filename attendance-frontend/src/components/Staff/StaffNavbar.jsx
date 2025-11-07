import React from "react";


export default function StaffNavbar({ now }) {
  const staffName =
    localStorage.getItem("staffName") || "Staff Member"; // optional

  return (
    <header
      className="d-flex align-items-center justify-content-between px-3 py-2 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)",
        color: "white",
      }}
    >
      {/* Left Section */}
      <div className="d-flex align-items-center gap-3">
        {/* 📱 Sidebar Toggle (Mobile Only) */}
        <button
          className="btn btn-outline-light d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileStaffSidebar"
          aria-controls="mobileStaffSidebar"
          aria-label="Open sidebar"
        >
          <BsList size={20} />
        </button>

        {/* 👨‍🏫 Staff Info */}
        <div>
          <h5 className="mb-0 fw-semibold">Welcome, {staffName}</h5>
          <small className="text-white-50">Staff Dashboard</small>
        </div>
      </div>

      {/* Right Section — Date/Time */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center bg-white text-dark px-3 py-1 rounded shadow-sm">
          <BsCalendarDate className="me-2 text-primary" size={16} />
          <div className="small fw-semibold">
            {now.toLocaleDateString()} <br />
            <span className="text-muted small">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div
          className="bg-white text-primary p-2 rounded-circle shadow-sm"
          style={{
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BsPersonBadge size={20} />
        </div>
      </div>
    </header>
  );
}
