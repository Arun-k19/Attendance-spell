import React from "react";

export default function AdminSidebar({ activeTab, setActiveTab, handleLogout }) {

  const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "manageHOD", label: "Manage HOD" },
    { key: "manageStaff", label: "Manage Staff" },
    { key: "manageStudents", label: "Manage Students" },
    { key: "attendance", label: "Attendance" },
    { key: "reports", label: "Reports" },
  ];

  const handleMenuClick = (key) => {
    setActiveTab(key);

    // close mobile sidebar after click
    const sidebar = document.getElementById("mobileSidebar");
    if (sidebar) {
      const offcanvas = window.bootstrap?.Offcanvas.getInstance(sidebar);
      if (offcanvas) offcanvas.hide();
    }
  };

  const renderLink = (m) => (
    <button
      type="button"
      onClick={() => handleMenuClick(m.key)}
      className={`nav-link text-start w-100 border-0 bg-transparent ${
        activeTab === m.key ? "active fw-bold text-primary" : "text-dark"
      }`}
    >
      {m.label}
    </button>
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="d-md-none p-2 border-bottom bg-white d-flex align-items-center">

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            const sidebar = new window.bootstrap.Offcanvas(
              document.getElementById("mobileSidebar")
            );
            sidebar.show();
          }}
        >
          ☰
        </button>

        <h6 className="ms-3 mb-0 fw-bold">Admin Panel</h6>

      </div>

      {/* Desktop Sidebar */}
      <aside
        className="bg-white border-end d-none d-md-flex flex-column"
        style={{
          width: 260,
          minHeight: "100vh",
          boxShadow: "0 4px 18px rgba(37,99,235,0.06)",
        }}
      >

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
            }}
          />

          <div>
            <div className="fw-bold">College Attendance</div>
            <small className="text-white-50">Admin Panel</small>
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

          <button
            type="button"
            className="btn btn-danger w-100"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* Mobile Sidebar */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mobileSidebar"
      >

        <div
          className="offcanvas-header"
          style={{
            background: "linear-gradient(90deg,#1e3a8a,#2563eb)",
            color: "#fff",
          }}
        >

          <h5 className="offcanvas-title text-white">
            College Admin
          </h5>

          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
          ></button>

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

            <button
              type="button"
              className="btn btn-danger w-100"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>
    </>
  );
}