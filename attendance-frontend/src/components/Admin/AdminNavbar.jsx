import React from "react";

export default function AdminNavbar({ now }) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
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
      style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", color: "white" }}
    >
      {/* Left — menu + welcome */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminMobileSidebar"
          aria-controls="adminMobileSidebar"
          style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "white",
            display: "flex", alignItems: "center",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd"
              d="M2.5 12.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>

        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Welcome, Admin 👑</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            Attendance Management System
          </div>
        </div>
      </div>

      {/* Right — date time card */}
      <div style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 12, padding: "7px 14px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Date */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {dateNum}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)",
            letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
            {dateMonth}
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.25)" }} />

        {/* Time */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff",
            letterSpacing: 1, fontVariantNumeric: "tabular-nums" }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            {dayName}
          </div>
        </div>
      </div>
    </header>
  );
}