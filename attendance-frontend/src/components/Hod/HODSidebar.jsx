import React from "react";

export default function HODSidebar({ activeTab, setActiveTab, handleLogout }) {
  const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "students", label: "Students" },
    { key: "staffs", label: "Staffs" },
    { key: "attendance", label: "Attendance" },
    { key: "reports", label: "Reports" },
  ];

  const renderLink = (m) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActiveTab(m.key);
      }}
      className={`nav-link text-start ${activeTab === m.key ? "active" : ""}`}
      data-bs-dismiss="offcanvas"
    >
      {m.label}
    </a>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="bg-white border-end d-none d-md-flex flex-column"
        style={{ width: 260, minHeight: "100vh", boxShadow: "0 4px 18px rgba(37,99,235,0.06)" }}
      >
        <div className="p-3 d-flex align-items-center gap-3 border-bottom"
          style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", color: "#fff" }}>
          <img src="/chendhuran-logo.png" alt="logo"
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "2px solid rgba(255,255,255,0.12)" }} />
          <div>
            <div className="fw-bold">College Attendance</div>
            <small className="text-white-50">HOD Panel</small>
          </div>
        </div>

        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column">
            {menu.map((m) => (
              <li className="nav-item mb-1" key={m.key}>
                {renderLink(m)}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Offcanvas for Mobile */}
      <div className="d-md-none">
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="hodSidebar" aria-labelledby="hodSidebarLabel">
          <div className="offcanvas-header"
            style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", color: "#fff" }}>
            <h5 className="offcanvas-title text-white" id="hodSidebarLabel">HOD Panel</h5>
            <button type="button" className="btn-close btn-close-white text-reset"
              data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div className="offcanvas-body p-0">
            <nav className="p-3">
              <ul className="nav nav-pills flex-column">
                {menu.map((m) => (
                  <li className="nav-item mb-1" key={m.key}>
                    {renderLink(m)}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-3 border-top">
              <button className="btn btn-danger w-100" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
