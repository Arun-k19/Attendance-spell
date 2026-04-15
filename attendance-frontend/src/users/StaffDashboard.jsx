import React, { useEffect, useState } from "react";
import StaffSidebar from "../components/Staff/StaffSidebar";
import StaffNavbar from "../components/Staff/StaffNavbar";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());

  const [selectedYear, setSelectedYear] = useState("all");

  const [counts, setCounts] = useState({
    totalStudents: 60,
    totalClasses: 12,
    attendancePercent: 75,
  });

  // 🔥 Dummy Students (same pattern like HOD)
  const students = [
    { name: "Arun", year: "3" },
    { name: "Kumar", year: "2" },
    { name: "Deepak", year: "4" },
    { name: "Rohit", year: "1" },
    { name: "Vijay", year: "3" },
  ];

  // Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <StaffSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={() => (window.location.href = "/")}
      />

      {/* 🔥 MAIN CONTENT FIX */}
      <div className="staff-main">

        <StaffNavbar now={now} />

        <main className="p-4 container-fluid">

          {activeTab === "dashboard" && (
            <section>

              <h3 className="fw-bold mb-3">Staff Dashboard</h3>

              {/* Banner */}
              <div
                className="shadow-sm p-4 mb-4"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(90deg,#2563eb,#1e40af)",
                  color: "white",
                }}
              >
                <h5 className="fw-bold">Welcome to Staff Dashboard 👨‍🏫</h5>
                <p className="mb-0">
                  Manage attendance and view reports efficiently.
                </p>
              </div>

              {/* 🔥 CARDS */}
              <div className="row g-4 mb-4">

                <DashboardCard title="Students" value={counts.totalStudents} />
                <DashboardCard title="Classes Taken" value={counts.totalClasses} />
                <DashboardCard title="Attendance" value={`${counts.attendancePercent}%`} />

              </div>

              {/* 🔥 YEAR FILTER */}
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

              {/* 🔥 STUDENTS PREVIEW */}
              <div className="row">

                <div className="col-md-6">
                  <div className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}>

                    <h6 className="fw-bold mb-3">Students</h6>

                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <ul className="list-group">

                        {students
                          .filter(s => selectedYear === "all" || s.year === selectedYear)
                          .map((s, i) => (
                            <li key={i}
                              className="list-group-item d-flex justify-content-between">
                              {s.name}
                              <span className="badge bg-primary">Y{s.year}</span>
                            </li>
                          ))}

                      </ul>
                    </div>

                  </div>
                </div>

                {/* 🔥 QUICK ACTIONS */}
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}>

                    <h6 className="fw-bold mb-3">Quick Actions</h6>

                    <button
                      className="btn btn-primary w-100 mb-2"
                      onClick={() => setActiveTab("attendance")}
                    >
                      📘 Take Attendance
                    </button>

                    <button
                      className="btn btn-success w-100"
                      onClick={() => setActiveTab("reports")}
                    >
                      📊 View Reports
                    </button>

                  </div>
                </div>

              </div>

            </section>
          )}

          {activeTab === "attendance" && <AttendancePage />}
          {activeTab === "reports" && <Reports />}

        </main>
      </div>
    </div>
  );
}

// 🔥 CARD COMPONENT
const DashboardCard = ({ title, value }) => (
  <div className="col-md-4">
    <div className="card text-center border-0 shadow-sm p-4"
      style={{ borderRadius: "16px" }}>
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold text-primary">{value}</h2>
    </div>
  </div>
);