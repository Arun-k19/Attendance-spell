import React from "react";

const menu = [
  { key: "dashboard",      label: "Dashboard",       icon: "📊" },
  { key: "manageHOD",      label: "Manage HOD",      icon: "🧑‍💼" },
  { key: "manageStaff",    label: "Manage Staff",    icon: "👨‍🏫" },
  { key: "manageStudents", label: "Manage Students", icon: "🎓" },
  { key: "attendance",     label: "Attendance",      icon: "📅" },
  { key: "reports",        label: "Reports",         icon: "📄" },
];

export default function AdminSidebar({ activeTab, setActiveTab, handleLogout }) {

  const renderLink = (m, dismiss = false) => (
    <button
      type="button"
      onClick={() => setActiveTab(m.key)}
      {...(dismiss ? { "data-bs-dismiss": "offcanvas" } : {})}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "10px 12px", marginBottom: 2,
        border: "none", borderRadius: 8, cursor: "pointer",
        fontSize: 14, fontWeight: activeTab === m.key ? 600 : 400,
        transition: "all 0.18s",
        background: activeTab === m.key
          ? "linear-gradient(90deg,#2563eb,#3b82f6)" : "transparent",
        color: activeTab === m.key ? "#fff" : "#374151",
        boxShadow: activeTab === m.key
          ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
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
      {/* ── DESKTOP: Fixed Sidebar (hidden on mobile) ── */}
      <aside
        className="bg-white border-end d-none d-md-flex flex-column"
        style={{
          width: 250, minHeight: "100vh",
          position: "fixed", top: 0, left: 0, zIndex: 1000,
          boxShadow: "0 4px 18px rgba(37,99,235,0.06)",
        }}
      >
        <div
          className="p-3 d-flex align-items-center gap-3 border-bottom"
          style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", color: "#fff" }}
        >
          <img src="/chendhuran-logo.png" alt="logo"
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8,
              border: "2px solid rgba(255,255,255,0.2)" }} />
          <div>
            <div className="fw-bold">College Attendance</div>
            <small className="text-white-50">Admin Panel</small>
          </div>
        </div>
        <nav className="flex-grow-1 p-2">
          {menu.map((m) => <div key={m.key}>{renderLink(m, false)}</div>)}
        </nav>
        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE: Offcanvas only ── */}
      <div className="offcanvas offcanvas-start" tabIndex="-1"
        id="adminMobileSidebar" style={{ width: 260 }}>
        <div className="offcanvas-header"
          style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", color: "#fff" }}>
          <div className="d-flex align-items-center gap-2">
            <img src="/chendhuran-logo.png" alt="logo"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
            <div>
              <div className="fw-bold text-white" style={{ fontSize: 14 }}>College Attendance</div>
              <small className="text-white-50">Admin Panel</small>
            </div>
          </div>
          <button type="button" className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body p-0 d-flex flex-column">
          <nav className="flex-grow-1 p-2">
            {menu.map((m) => <div key={m.key}>{renderLink(m, true)}</div>)}
          </nav>
          <div className="p-3 border-top">
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}