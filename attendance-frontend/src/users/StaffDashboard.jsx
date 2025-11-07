import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/Admin/AdminNavbar";
import StaffSidebar from "../components/Staff/StaffSidebar";
import StaffNavbar from "../components/Staff/StaffNavbar"; // ✅ Use StaffSidebar here
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts } from "../api/dashboardApi"; // ✅ Fetch staff-specific data if available

export default function StaffDashboard() {
  // 🌟 State Management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [counts, setCounts] = useState({
    todayAttendance: 0,
    totalClassesTaken: 0,
    deptStudents: 0,
  });

  // 🕒 Live Clock (updates every second)
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 📊 Fetch Staff Dashboard Data
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDashboardCounts();
        setCounts({
          todayAttendance: res.data?.attendancePercent || 85,
          totalClassesTaken: res.data?.totalClasses || 12,
          deptStudents: res.data?.deptStudents || 60,
        });
      } catch (err) {
        console.error("❌ Error fetching staff dashboard counts:", err);
      }
    };
    fetchCounts();
  }, []);

  // 🚪 Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("staffAuth");
      window.location.href = "/";
    }
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}
    >
      {/* 🧭 Sidebar */}
      <StaffSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* 🧱 Main Section */}
      <div className="flex-grow-1">
        {/* Top Navbar */}
        <AdminNavbar now={now} />

        <main className="p-4">
          {/* 🏠 Dashboard Section */}
          {activeTab === "dashboard" && (
            <section>
              <h3 className="mb-3 fw-semibold">Staff Dashboard</h3>
              <p className="text-muted mb-4">
                Welcome! Here you can manage attendance and view reports for your department.
              </p>

              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <small className="text-muted">Department Students</small>
                      <div className="h3 fw-bold mt-2">
                        {counts.deptStudents}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <small className="text-muted">Total Classes Taken</small>
                      <div className="h3 fw-bold mt-2">
                        {counts.totalClassesTaken}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <div className="h3 fw-bold mt-2">
                        {counts.todayAttendance}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <div
                    className="card shadow-sm border-0 text-center p-3 h-100"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("attendance")}
                  >
                    <div className="card-body">
                      <h5 className="fw-semibold">📘 Attendance</h5>
                      <p className="text-muted mb-0">
                        Mark or view student attendance easily.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <div
                    className="card shadow-sm border-0 text-center p-3 h-100"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("reports")}
                  >
                    <div className="card-body">
                      <h5 className="fw-semibold">📊 Reports</h5>
                      <p className="text-muted mb-0">
                        Generate and export attendance reports effortlessly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 📝 Attendance Section */}
          {activeTab === "attendance" && (
            <section>
              <h4 className="mb-3 fw-semibold">📘 Attendance Management</h4>
              <AttendancePage />
            </section>
          )}

          {/* 📈 Reports Section */}
          {activeTab === "reports" && (
            <section>
              <h4 className="mb-3 fw-semibold">📊 Reports Overview</h4>
              <Reports />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
