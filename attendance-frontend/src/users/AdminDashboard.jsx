import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import ManageHods from "../Pages/ManageHods";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts } from "../api/dashboardApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");

  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalHods: 0,
    attendancePercent: 0,
  });

  const [deptStats, setDeptStats] = useState([]);

  const deptDetails = {
    CSE: {
      hod: "Dr. Rajesh",
      attendance: 78,
      students: [
        { name: "Arun", year: "3" },
        { name: "Kumar", year: "2" },
        { name: "Deepak", year: "4" },
        { name: "Rohit", year: "1" },
      ],
      staff: [{ name: "Prof. Anand" }, { name: "Prof. Meena" }],
    },
    ECE: {
      hod: "Dr. Kumar",
      attendance: 65,
      students: [
        { name: "Ravi", year: "3" },
        { name: "Ajay", year: "2" },
      ],
      staff: [{ name: "Prof. Suresh" }],
    },
    MECH: {
      hod: "Dr. Vignesh",
      attendance: 55,
      students: [
        { name: "Vijay", year: "1" },
        { name: "Rahul", year: "3" },
      ],
      staff: [{ name: "Prof. Mani" }],
    },
    CIVIL: {
      hod: "Dr. Siva",
      attendance: 60,
      students: [{ name: "Siva", year: "4" }],
      staff: [{ name: "Prof. Bala" }],
    },
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDashboardCounts();
        setCounts(res.data);
      } catch {
        setCounts({
          totalStudents: 120,
          totalStaff: 35,
          totalHods: 5,
          attendancePercent: 68,
        });
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const map = {};
    Object.keys(deptDetails).forEach((d) => {
      map[d] = deptDetails[d].students.length;
    });

    setDeptStats(
      Object.keys(map).map((d) => ({
        dept: d,
        count: map[d],
      }))
    );
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

              {/* Dept Cards */}
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
                            transition: "0.3s",
                          }}
                          onClick={() => setSelectedDept(d.dept)}
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
                          <h2 className="fw-bold text-primary">{d.count}</h2>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dept Details */}
              {selectedDept && (
                <div className="mt-5">

                  <div className="d-flex justify-content-between mb-3">
                    <h4 className="fw-bold">{selectedDept} Department</h4>
                    <button
                      className="btn btn-outline-secondary"
                      style={{ borderRadius: "20px" }}
                      onClick={() => {
                        setSelectedDept(null);
                        setSelectedYear("all");
                      }}
                    >
                      ⬅ Back
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="row g-3 mb-4">
                    <InfoCard title="HOD" value={deptDetails[selectedDept].hod} />
                    <InfoCard title="Attendance" value={deptDetails[selectedDept].attendance + "%"} />
                    <InfoCard title="Students" value={deptDetails[selectedDept].students.length} />
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
                            {deptDetails[selectedDept].students
                              .filter(s => selectedYear === "all" || s.year === selectedYear)
                              .map((s, i) => (
                                <li
                                  key={i}
                                  className="list-group-item d-flex justify-content-between"
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
                          {deptDetails[selectedDept].staff.map((s, i) => (
                            <li key={i} className="list-group-item">
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

// 🔥 Cards
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
        background: "linear-gradient(135deg,#f8fafc,#e0f2fe)",
      }}
    >
      <h6 className="text-muted">{title}</h6>
      <h5 className="fw-bold">{value}</h5>
    </div>
  </div>
);