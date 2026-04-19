import React, { useState } from "react";

const menu = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "staffs", label: "Staffs", icon: "👨‍🏫" },
  { key: "students", label: "Students", icon: "🎓" },
  { key: "attendance", label: "Attendance", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📄" },
];

export default function HODSidebar({ activeTab, setActiveTab, handleLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderLink = (m, dismiss = false) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(m.key);
        if (dismiss) setMobileOpen(false);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        marginBottom: 2,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: activeTab === m.key ? 600 : 400,
        transition: "all 0.2s",
        background: activeTab === m.key
          ? "linear-gradient(90deg,#2563eb,#3b82f6)"
          : "transparent",
        color: activeTab === m.key ? "#fff" : "#374151",
        boxShadow: activeTab === m.key
          ? "0 2px 8px rgba(37,99,235,0.25)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (activeTab !== m.key) {
          e.currentTarget.style.background = "#eff6ff";
          e.currentTarget.style.color = "#2563eb";
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== m.key) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#374151";
        }
      }}
    >
      <span style={{ fontSize: 17 }}>{m.icon}</span>
      {m.label}
      {activeTab === m.key && (
        <span style={{ marginLeft: "auto", fontSize: 9, opacity: 0.7 }}>●</span>
      )}
    </button>
  );

  return (
    <>
      {/* 🔥 Desktop Sidebar */}
      <aside
        className="bg-white border-end d-none d-md-flex flex-column"
        style={{
          width: 250,
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: "0 4px 18px rgba(37,99,235,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="p-3 d-flex align-items-center gap-3 border-bottom"
          style={{
            background: "linear-gradient(90deg,#1e3a8a,#2563eb)",
            color: "#fff",
          }}
        >
          <img
            src="/chendhuran-logo.png"
            alt="logo"
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 8,
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          />
          <div>
            <div className="fw-bold">College Attendance</div>
            <small className="text-white-50">HOD Panel</small>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-grow-1 p-2">
          {menu.map((m) => (
            <div key={m.key}>{renderLink(m)}</div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* 🔥 Mobile Toggle Button */}
      <button
        className="d-md-none"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1100,
          background: "#2563eb",
          border: "none",
          borderRadius: 8,
          padding: "6px 10px",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* 🔥 Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1099,
          }}
        />
      )}

      {/* 🔥 Mobile Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: mobileOpen ? 0 : -270,
          width: 260,
          height: "100vh",
          background: "#fff",
          zIndex: 1100,
          transition: "left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Mobile Header */}
        <div
          className="d-flex align-items-center gap-2 p-3"
          style={{
            background: "linear-gradient(90deg,#1e3a8a,#2563eb)",
            color: "#fff",
          }}
        >
          <img
            src="/chendhuran-logo.png"
            alt="logo"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
          />
          <div>
            <div className="fw-bold text-white" style={{ fontSize: 14 }}>
              College Attendance
            </div>
            <small className="text-white-50">HOD Panel</small>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className="flex-grow-1 p-2">
          {menu.map((m) => (
            <div key={m.key}>{renderLink(m, true)}</div>
          ))}
        </nav>

        {/* Mobile Logout */}
        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}