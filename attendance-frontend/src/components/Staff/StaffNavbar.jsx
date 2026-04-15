import React from "react";

export default function StaffNavbar({ now }) {

  const staffName =
    localStorage.getItem("staffName") || "Staff Member";

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const dateNum   = now.getDate();
  const dateMonth = months[now.getMonth()] + ' ' + now.getFullYear();
  const dayName   = days[now.getDay()];
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${h}:${m}:${s}`;

  return (
    <header
      className="d-flex align-items-center justify-content-between px-3 py-2"
      style={{
        background: "linear-gradient(90deg,#1e3a8a,#2563eb)",
        color: "white"
      }}
    >

      {/* 🔥 LEFT */}
      <div className="d-flex align-items-center gap-3">

        {/* Sidebar Toggle */}
        <button
          className="d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileStaffSidebar"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8,
            padding: "7px 10px",
            color: "white"
          }}
        >
          ☰
        </button>

        {/* Staff Info */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            Welcome, Staff 👨‍🏫
          </div>
          <div style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)"
          }}>
            Staff Dashboard
          </div>
        </div>

      </div>

      {/* 🔥 RIGHT (DATE CARD SAME AS HOD) */}
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >

        {/* Date */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1
          }}>
            {dateNum}
          </div>

          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 1
          }}>
            {dateMonth}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1,
          height: 32,
          background: "rgba(255,255,255,0.25)"
        }} />

        {/* Time */}
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 700
          }}>
            {timeStr}
          </div>

          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.6)"
          }}>
            {dayName}
          </div>
        </div>

      </div>

    </header>
  );
}