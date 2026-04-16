import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import ManageHods from "../Pages/ManageHods";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts, getDepartmentDetails } from "../api/dashboardApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [deptData, setDeptData] = useState(null);

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
      { dept: "ECE" },
      { dept: "MECH" },
      { dept: "CIVIL" },
    ]);
  }, []);

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

              {/* Cards */}
              <div className="row g-4">
                <DashboardCard title="Students" value={counts.totalStudents} />
                <DashboardCard title="Staff" value={counts.totalStaff} />
                <DashboardCard title="HODs" value={counts.totalHods} />
                <DashboardCard title="Attendance" value={counts.attendancePercent + "%"} />
              </div>

              {/* Departments */}
              {!selectedDept && (
                <div className="mt-5">
                  <h5 className="fw-bold mb-3">Departments</h5>

                  <div className="row g-3">
                    {deptStats.map((d, i) => (
                      <div key={i} className="col-md-3">
                        <div
                          className="card border-0 shadow-sm p-4 text-center"
                          style={{
                            borderRadius: "16px",
                            cursor: "pointer",
                            transition: "0.3s"
                          }}
                          onClick={async () => {
                            setSelectedDept(d.dept);

                            try {
                              const res = await getDepartmentDetails(d.dept);
                              setDeptData(res.data);
                            } catch (err) {
                              console.error(err);
                              alert("Failed to load department data");
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.background = "#eff6ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.background = "white";
                          }}
                        >
                          <h6>{d.dept}</h6>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Details */}
              {selectedDept && (
                <div className="mt-5">

                  <div className="d-flex justify-content-between mb-3">
                    <h4 className="fw-bold">{selectedDept} Department</h4>
                    <button
                      className="btn btn-outline-secondary"
                      style={{ borderRadius: "20px" }}
                      onClick={() => {
                        setSelectedDept(null);
                        setDeptData(null);
                        setSelectedYear("all");
                      }}
                    >
                      ⬅ Back
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="row g-3 mb-4">
                    <InfoCard title="HOD" value={deptData?.hod || "-"} />
                    <InfoCard title="Attendance" value={(deptData?.attendancePercent || 0) + "%"} />
                    <InfoCard title="Students" value={deptData?.students?.length || 0} />
                  </div>

                  {/* Year Filter */}
                  <div className="mb-3">
                    {["all", "1", "2", "3", "4"].map((y) => (
                      <button
                        key={y}
                        className={`btn me-2 ${
                          selectedYear === y ? "btn-primary" : "btn-light"
                        }`}
                        style={{ borderRadius: "20px" }}
                        onClick={() => setSelectedYear(y)}
                      >
                        {y === "all" ? "All" : `${y} Year`}
                      </button>
                    ))}
                  </div>

                  <div className="row">

                    {/* Students */}
                    <div className="col-md-6">
                      <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "16px" }}>
                        <h6 className="fw-bold mb-3">Students</h6>

                        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                          <ul className="list-group">
                            {deptData?.students
                              ?.filter(s => selectedYear === "all" || s.year === selectedYear)
                              ?.map((s, i) => (
                                <li
                                  key={i}
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                  style={{ borderRadius: "8px", marginBottom: "6px" }}
                                >
                                  {s.name}
                                  <span className="badge bg-primary">Y{s.year}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="col-md-6">
                      <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "16px" }}>
                        <h6 className="fw-bold mb-3">Staff</h6>

                        <ul className="list-group">
                          {deptData?.staff?.map((s, i) => (
                            <li
                              key={i}
                              className="list-group-item"
                              style={{ borderRadius: "8px", marginBottom: "6px" }}
                            >
                              {s.name}
                            </li>
                          ))}
                        </ul>

                      </div>
                    </div>

                  </div>
                </div>
              )}

            </section>
          )}

          {activeTab === "manageStudents" && <ManageStudents />}
          {activeTab === "manageStaff" && <ManageStaffs />}
          {activeTab === "manageHOD" && <ManageHods />}
          {activeTab === "attendance" && <AttendancePage />}
          {activeTab === "reports" && <Reports />}

        </main>
      </div>
    </div>
  );
}

// Cards
const DashboardCard = ({ title, value }) => (
  <div className="col-md-3">
    <div
      className="card text-center border-0 shadow-sm p-4"
      style={{ borderRadius: "16px", transition: "0.3s" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
    >
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold text-primary">{value}</h2>
    </div>
  </div>
);

const InfoCard = ({ title, value }) => (
  <div className="col-md-4">
    <div
      className="card border-0 shadow-sm text-center p-4"
      style={{
        borderRadius: "16px",
        background: "linear-gradient(135deg,#f8fafc,#e0f2fe)"
      }}
    >
      <h6 className="text-muted">{title}</h6>
      <h5 className="fw-bold">{value}</h5>
    </div>
  </div>
);