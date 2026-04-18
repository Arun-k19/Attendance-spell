import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import ManageUsers from "../Pages/ManageUsers";
import ManageHods from "../Pages/ManageHods";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts, getDepartmentDetails } from "../api/dashboardApi";

// Department config - emoji + color
const DEPT_CONFIG = {
  CSE:   { emoji: "💻", color: "#2563eb" },
  IT:    { emoji: "🖥️", color: "#7c3aed" },
  ECE:   { emoji: "📡", color: "#0891b2" },
  MECH:  { emoji: "⚙️", color: "#b45309" },
  CIVIL: { emoji: "🏗️", color: "#15803d" },
  EEE:   { emoji: "⚡", color: "#dc2626" },
};

const YEAR_LABELS = {
  all: "All",
  "1": "I Year",
  "2": "II Year",
  "3": "III Year",
  "4": "IV Year",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [deptData, setDeptData] = useState(null);
  const [deptLoading, setDeptLoading] = useState(false);

  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalHods: 0,
    attendancePercent: 0,
  });

  const [deptStats, setDeptStats] = useState([]);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Dashboard counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDashboardCounts();
        setCounts(res.data);
      } catch {
        console.log("Fallback counts");
      }
    };
    fetchCounts();
  }, []);

  // Departments
  useEffect(() => {
    setDeptStats([
      { dept: "CSE" },
      { dept: "IT" },
      { dept: "ECE" },
      { dept: "MECH" },
      { dept: "CIVIL" },
      { dept: "EEE" },
    ]);
  }, []);

  const handleDeptClick = async (dept) => {
    setSelectedDept(dept);
    setDeptLoading(true);
    try {
      const res = await getDepartmentDetails(dept);
      setDeptData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load department data");
    } finally {
      setDeptLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedDept(null);
    setDeptData(null);
    setSelectedYear("all");
  };

  const attendancePercent = deptData?.attendancePercent || 0;
  const isLowAttendance = attendancePercent > 0 && attendancePercent < 75;

  const filteredStudents = deptData?.students?.filter(
    (s) => selectedYear === "all" || s.year === selectedYear
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={() => (window.location.href = "/")}
      />

      <div className="admin-main">
        <AdminNavbar now={now} />

        <main className="p-4 container-fluid">

          {activeTab === "dashboard" && (
            <section>
              <h3 className="fw-bold mb-3">Admin Dashboard</h3>

              {/* Banner */}
              <div
                className="shadow-sm p-4 mb-4"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(90deg,#2563eb,#1e40af)",
                  color: "white",
                }}
              >
                <h5 className="fw-bold">Welcome Admin 👑</h5>
                <p className="mb-0">Manage everything in one place easily.</p>
              </div>

              {/* Stats Cards */}
              <div className="row g-4">
                <DashboardCard title="Students"  value={counts.totalStudents}           icon="🎓" />
                <DashboardCard title="Staff"     value={counts.totalStaff}              icon="👨‍🏫" />
                <DashboardCard title="HODs"      value={counts.totalHods}               icon="👑" />
                <DashboardCard title="Attendance" value={counts.attendancePercent + "%"} icon="📊" />
              </div>

              {/* Departments Grid */}
              {!selectedDept && (
                <div className="mt-5">
                  <h5 className="fw-bold mb-3">Departments</h5>
                  <div className="row g-3">
                    {deptStats.map((d, i) => {
                      const cfg = DEPT_CONFIG[d.dept] || { emoji: "🏫", color: "#6b7280" };
                      return (
                        <div key={i} className="col-md-2 col-sm-4 col-6">
                          <div
                            className="card border-0 shadow-sm p-4 text-center"
                            style={{
                              borderRadius: "16px",
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                              borderTop: `4px solid ${cfg.color}`,
                            }}
                            onClick={() => handleDeptClick(d.dept)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-5px)";
                              e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.color}33`;
                              e.currentTarget.style.background = "#eff6ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "";
                              e.currentTarget.style.background = "white";
                            }}
                          >
                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cfg.emoji}</div>
                            <h6 className="fw-bold mb-0" style={{ color: cfg.color }}>{d.dept}</h6>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Department Details */}
              {selectedDept && (
                <div className="mt-5">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "28px" }}>
                        {DEPT_CONFIG[selectedDept]?.emoji}
                      </span>
                      <h4 className="fw-bold mb-0">{selectedDept} Department</h4>
                      {/* Low attendance warning */}
                      {isLowAttendance && (
                        <span
                          className="badge ms-2"
                          style={{ background: "#fee2e2", color: "#dc2626", fontSize: "12px", padding: "6px 10px", borderRadius: "20px" }}
                        >
                          ⚠️ Low Attendance
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-outline-secondary"
                      style={{ borderRadius: "20px" }}
                      onClick={handleBack}
                    >
                      ⬅ Back
                    </button>
                  </div>

                  {/* Loading */}
                  {deptLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" />
                      <p className="mt-2 text-muted">Loading department data...</p>
                    </div>
                  ) : (
                    <>
                      {/* Info Cards */}
                      <div className="row g-3 mb-4">
                        <InfoCard title="HOD"        value={deptData?.hod || "-"}                  icon="👑" />
                        <InfoCard title="Attendance"  value={attendancePercent + "%"}               icon="📊" warn={isLowAttendance} />
                        <InfoCard title="Students"    value={deptData?.students?.length || 0}      icon="🎓" />
                        <InfoCard title="Staff Count" value={deptData?.staff?.length || 0}         icon="👨‍🏫" />
                      </div>

                      {/* Year Filter */}
                      <div className="mb-3">
                        {["all", "1", "2", "3", "4"].map((y) => (
                          <button
                            key={y}
                            className={`btn me-2 mb-2 ${selectedYear === y ? "btn-primary" : "btn-light"}`}
                            style={{ borderRadius: "20px", fontWeight: selectedYear === y ? "bold" : "normal" }}
                            onClick={() => setSelectedYear(y)}
                          >
                            {YEAR_LABELS[y]}
                          </button>
                        ))}
                      </div>

                      <div className="row">
                        {/* Students */}
                        <div className="col-md-6 mb-3">
                          <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "16px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold mb-0">🎓 Students</h6>
                              <span className="badge bg-primary rounded-pill">
                                {filteredStudents?.length || 0}
                              </span>
                            </div>
                            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                              {filteredStudents?.length === 0 ? (
                                <p className="text-muted text-center py-3">No students found</p>
                              ) : (
                                <ul className="list-group list-group-flush">
                                  {filteredStudents?.map((s, i) => (
                                    <li
                                      key={i}
                                      className="list-group-item d-flex justify-content-between align-items-center"
                                      style={{ borderRadius: "8px", marginBottom: "4px" }}
                                    >
                                      {s.name}
                                      <span className="badge bg-primary">{YEAR_LABELS[s.year] || `Y${s.year}`}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Staff */}
                        <div className="col-md-6 mb-3">
                          <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "16px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold mb-0">👨‍🏫 Staff</h6>
                              <span className="badge bg-success rounded-pill">
                                {deptData?.staff?.length || 0}
                              </span>
                            </div>
                            {deptData?.staff?.length === 0 ? (
                              <p className="text-muted text-center py-3">No staff found</p>
                            ) : (
                              <ul className="list-group list-group-flush">
                                {deptData?.staff?.map((s, i) => (
                                  <li
                                    key={i}
                                    className="list-group-item"
                                    style={{ borderRadius: "8px", marginBottom: "4px" }}
                                  >
                                    {s.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === "manageStudents" && <ManageStudents />}
          {activeTab === "manageStaff"    && <ManageStaffs />}
          {activeTab === "manageHOD"      && <ManageHods />}
          {activeTab === "manageUsers" && <ManageUsers />}
          {activeTab === "attendance"     && <AttendancePage />}
          {activeTab === "reports"        && <Reports />}
          
        </main>
      </div>
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────

const DashboardCard = ({ title, value, icon }) => (
  <div className="col-md-3 col-sm-6">
    <div
      className="card text-center border-0 shadow-sm p-4"
      style={{ borderRadius: "16px", transition: "0.3s" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
    >
      <div style={{ fontSize: "28px", marginBottom: "6px" }}>{icon}</div>
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold text-primary mb-0">{value}</h2>
    </div>
  </div>
);

const InfoCard = ({ title, value, icon, warn }) => (
  <div className="col-md-3 col-sm-6">
    <div
      className="card border-0 shadow-sm text-center p-4"
      style={{
        borderRadius: "16px",
        background: warn
          ? "linear-gradient(135deg,#fff1f2,#fee2e2)"
          : "linear-gradient(135deg,#f8fafc,#e0f2fe)",
      }}
    >
      <div style={{ fontSize: "22px", marginBottom: "4px" }}>{icon}</div>
      <h6 className="text-muted">{title}</h6>
      <h5 className="fw-bold mb-0" style={{ color: warn ? "#dc2626" : "inherit" }}>
        {value}
      </h5>
    </div>
  </div>
);