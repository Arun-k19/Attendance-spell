import React, { useEffect, useState } from "react";
import Papa from "papaparse";

/**
 * AdminDashboard.jsx
 * Modern Blue Theme - Bootstrap only
 *
 * Single-file component including:
 * - Navbar (with date/time & logout)
 * - Sidebar (desktop fixed / mobile offcanvas)
 * - Pages: Dashboard, ManageStudents, ManageHOD, Attendance, Reports
 *
 * Place your college logo as /public/chendhuran-logo.png or change src path.
 */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());

  // For ManageStudents
  const [stuFile, setStuFile] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);

  // For ManageHOD
  const [hods, setHods] = useState([
    { id: 1, name: "Dr. Suresh Kumar", dept: "CSE", email: "suresh@college.edu", phone: "9876543210" },
  ]);
  const [hodForm, setHodForm] = useState({ name: "", dept: "", email: "", phone: "" });

  // Demo stats (replace with API data later)
  const studentsDemo = [
    { regNo: "CSE101", name: "Arun", dept: "CSE", year: "4th", attendance: 80 },
    { regNo: "CSE102", name: "Bala", dept: "CSE", year: "4th", attendance: 70 },
    { regNo: "ECE101", name: "Chitra", dept: "ECE", year: "3rd", attendance: 90 },
  ];

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Logout handler (single logout)
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Add your logout logic (clear tokens etc) then redirect
      window.location.href = "/";
    }
  };

  // CSV upload for Manage Students (frontend preview)
  const handleStudentUpload = () => {
    if (!stuFile) {
      alert("Please choose a CSV file to upload.");
      return;
    }
    Papa.parse(stuFile, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const mapped = res.data.map((r, idx) => ({
          regNo: r.RegNo || r.regno || r.Reg || `R-${idx + 1}`,
          name: r.Name || r.name || "N/A",
          dept: r.Department || r.Dept || r.dept || "N/A",
          year: r.Year || r.year || "N/A",
        }));
        setUploadedStudents(mapped);
        alert("CSV parsed — preview loaded (frontend only).");
      },
      error: (err) => {
        console.error(err);
        alert("Failed to parse CSV.");
      },
    });
  };

  // HOD CRUD (in-memory)
  const addHod = () => {
    if (!hodForm.name || !hodForm.dept) {
      alert("Please fill at least Name & Department.");
      return;
    }
    const newHod = { id: Date.now(), ...hodForm };
    setHods((s) => [newHod, ...s]);
    setHodForm({ name: "", dept: "", email: "", phone: "" });
  };

  const deleteHod = (id) => {
    if (!window.confirm("Delete this HOD?")) return;
    setHods((s) => s.filter((h) => h.id !== id));
  };

  // UI Colors / styles for Modern Blue Theme
  const themeHeaderStyle = {
    background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)",
    color: "white",
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      {/* Sidebar (fixed on md+, offcanvas on small screens) */}
      <aside
        className="bg-white border-end d-none d-md-flex flex-column"
        style={{ width: 260, minHeight: "100vh", boxShadow: "0 4px 18px rgba(37,99,235,0.08)" }}
      >
        <div className="p-3 d-flex align-items-center gap-3 border-bottom" style={themeHeaderStyle}>
          <img
            src="/chendhuran-logo.png"
            alt="logo"
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "2px solid rgba(255,255,255,0.12)" }}
          />
          <div>
            <div className="fw-bold">College Attendance</div>
            <small className="text-white-50">Admin Panel</small>
          </div>
        </div>

        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column">
            <li className="nav-item mb-1">
              <button
                className={`nav-link text-start ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item mb-1">
              <button
                className={`nav-link text-start ${activeTab === "manageStudents" ? "active" : ""}`}
                onClick={() => setActiveTab("manageStudents")}
              >
                Manage Students
              </button>
            </li>
            <li className="nav-item mb-1">
              <button
                className={`nav-link text-start ${activeTab === "manageHOD" ? "active" : ""}`}
                onClick={() => setActiveTab("manageHOD")}
              >
                Manage HOD
              </button>
            </li>
            <li className="nav-item mb-1">
              <button
                className={`nav-link text-start ${activeTab === "attendance" ? "active" : ""}`}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance
              </button>
            </li>
            <li className="nav-item mb-1">
              <button
                className={`nav-link text-start ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => setActiveTab("reports")}
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Offcanvas Sidebar */}
      <div className="d-md-none">
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileSidebar" aria-labelledby="mobileSidebarLabel">
          <div className="offcanvas-header" style={themeHeaderStyle}>
            <h5 className="offcanvas-title text-white" id="mobileSidebarLabel">College Admin</h5>
            <button type="button" className="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body p-0">
            <nav className="p-3">
              <ul className="nav nav-pills flex-column">
                <li className="nav-item mb-1">
                  <button className="nav-link text-start" data-bs-dismiss="offcanvas" onClick={() => setActiveTab("dashboard")}>
                    Dashboard
                  </button>
                </li>
                <li className="nav-item mb-1">
                  <button className="nav-link text-start" data-bs-dismiss="offcanvas" onClick={() => setActiveTab("manageStudents")}>
                    Manage Students
                  </button>
                </li>
                <li className="nav-item mb-1">
                  <button className="nav-link text-start" data-bs-dismiss="offcanvas" onClick={() => setActiveTab("manageHOD")}>
                    Manage HOD
                  </button>
                </li>
                <li className="nav-item mb-1">
                  <button className="nav-link text-start" data-bs-dismiss="offcanvas" onClick={() => setActiveTab("attendance")}>
                    Attendance
                  </button>
                </li>
                <li className="nav-item mb-1">
                  <button className="nav-link text-start" data-bs-dismiss="offcanvas" onClick={() => setActiveTab("reports")}>
                    Reports
                  </button>
                </li>
              </ul>
            </nav>
            <div className="p-3 border-top">
              <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-grow-1">
        {/* Top Navbar */}
        <header className="d-flex align-items-center justify-content-between px-3 py-2" style={themeHeaderStyle}>
          <div className="d-flex align-items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="btn btn-outline-light d-md-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileSidebar"
              aria-controls="mobileSidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>

            <div className="ms-1">
              <h5 className="mb-0 text-white">Welcome, Admin</h5>
              <small className="text-white-50">Attendance Management System</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="px-3 py-2 bg-white rounded text-dark small">
              {now.toLocaleDateString()} {now.toLocaleTimeString()}
            </div>

            {/* Single Logout (desktop) */}
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          {activeTab === "dashboard" && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Dashboard</h3>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total Students</small>
                      <div className="h3 fw-bold mt-2">320</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total Staff</small>
                      <div className="h3 fw-bold mt-2">28</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total HOD</small>
                      <div className="h3 fw-bold mt-2">{hods.length}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <div className="h3 fw-bold mt-2">87%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-lg-8">
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Student Attendance</h5>
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Reg No</th>
                              <th>Name</th>
                              <th>Dept</th>
                              <th>Year</th>
                              <th>Attendance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsDemo.map((s, idx) => (
                              <tr key={idx}>
                                <td>{s.regNo}</td>
                                <td>{s.name}</td>
                                <td>{s.dept}</td>
                                <td>{s.year}</td>
                                <td className={`fw-bold ${s.attendance < 75 ? "text-danger" : "text-success"}`}>{s.attendance}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-title">Quick Actions</h6>
                      <div className="d-grid gap-2">
                        <button className="btn btn-primary">Import Students</button>
                        <button className="btn btn-success">Create Spell</button>
                        <button className="btn btn-outline-secondary">Export CSV</button>
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Alerts</h6>
                      <ul className="list-unstyled mb-0 small">
                        <li>• 12 students below 75% attendance</li>
                        <li>• 3 spells pending assignment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "manageStudents" && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Manage Students</h3>
                <div className="text-muted small">Upload CSV to preview students</div>
              </div>

              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-3">
                      <select className="form-select" aria-label="yearSelect">
                        <option>Year</option>
                        <option>1st</option>
                        <option>2nd</option>
                        <option>3rd</option>
                        <option>4th</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-3">
                      <select className="form-select" aria-label="deptSelect">
                        <option>Department</option>
                        <option>CSE</option>
                        <option>ECE</option>
                        <option>MECH</option>
                        <option>CIVIL</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <input type="file" accept=".csv" className="form-control" onChange={(e) => setStuFile(e.target.files[0])} />
                    </div>
                    <div className="col-12 col-md-2 d-grid">
                      <button className="btn btn-primary" onClick={handleStudentUpload}>Upload</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Reg No</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedStudents.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-4">No students uploaded — preview will appear here</td>
                          </tr>
                        ) : (
                          uploadedStudents.map((s, i) => (
                            <tr key={i}>
                              <td>{s.regNo}</td>
                              <td>{s.name}</td>
                              <td>{s.dept}</td>
                              <td>{s.year}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "manageHOD" && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Manage HOD</h3>
                <div className="text-muted small">Add / remove HODs</div>
              </div>

              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-12 col-md-3">
                      <input className="form-control" placeholder="Name" value={hodForm.name} onChange={(e) => setHodForm({ ...hodForm, name: e.target.value })} />
                    </div>
                    <div className="col-12 col-md-2">
                      <input className="form-control" placeholder="Department" value={hodForm.dept} onChange={(e) => setHodForm({ ...hodForm, dept: e.target.value })} />
                    </div>
                    <div className="col-12 col-md-3">
                      <input className="form-control" placeholder="Email (optional)" value={hodForm.email} onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })} />
                    </div>
                    <div className="col-12 col-md-2">
                      <input className="form-control" placeholder="Phone (optional)" value={hodForm.phone} onChange={(e) => setHodForm({ ...hodForm, phone: e.target.value })} />
                    </div>
                    <div className="col-12 col-md-2 d-grid">
                      <button className="btn btn-success" onClick={addHod}>Add HOD</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hods.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">No HODs added yet</td>
                          </tr>
                        ) : (
                          hods.map((h) => (
                            <tr key={h.id}>
                              <td>{h.name}</td>
                              <td>{h.dept}</td>
                              <td>{h.email || "-"}</td>
                              <td>{h.phone || "-"}</td>
                              <td>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteHod(h.id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "attendance" && (
            <section>
              <h3 className="mb-3">Attendance</h3>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="mb-1">Period-wise attendance features will be added here.</p>
                  <div className="small text-muted">You can implement marking, import/export, and spell management from here.</div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "reports" && (
            <section>
              <h3 className="mb-3">Reports</h3>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="mb-1">Reports & exports (CSV / PDF) will be available here.</p>
                  <div className="small text-muted">Add filters and export options as needed.</div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
