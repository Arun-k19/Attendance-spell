import React, { useEffect, useState } from "react";
import HODSidebar from "../components/Hod/HODSidebar";
import HODNavbar from "../components/Hod/HODNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getHODDashboardCounts } from "../api/dashboardApi";

export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [dept, setDept] = useState("");

  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaff: 0,
    attendancePercent: 0,
  });

  // 🕒 Live Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 👤 Get HOD department
  useEffect(() => {
  const hodData = JSON.parse(localStorage.getItem("hodData"));

  if (hodData) {
    setDept(hodData.department.toUpperCase());
    console.log("Dept loaded:", hodData.department.toUpperCase());
  }
}, []);

  // 📊 Fetch backend dashboard data
 useEffect(() => {
  if (dept) {
    console.log("Calling API with dept:", dept);

    getHODDashboardCounts(dept)
      .then((res) => {
        console.log("API RESPONSE:", res.data);

        setCounts({
          totalStudents: res.data.totalStudents,
          totalStaff: res.data.totalStaff,
          attendancePercent: res.data.attendancePercent,
        });
      })
      .catch((err) => {
        console.error("HOD dashboard fetch error:", err);
      });
  }
}, [dept]);

  // 🚪 Logout
  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.removeItem("hodData");
      window.location.href = "/";
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <HODSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="flex-grow-1">
        <HODNavbar now={now} dept={dept} />

        <main className="p-4">

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <section>
              <h3 className="mb-3">{dept} Department Dashboard</h3>

              <div
                className="alert border-0 shadow-sm"
                style={{
                  background: "linear-gradient(90deg,#2563eb,#1e3a8a)",
                  color: "white",
                }}
              >
                <h5>Welcome, HOD 👨‍🏫</h5>
                <p className="mb-0">
                  Manage students, staffs and track attendance of your department.
                </p>
              </div>

              {/* Cards */}
              <div className="row g-3 mt-4 mb-4">

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Department Students</small>
                      <h3 className="fw-bold mt-2">{counts.totalStudents}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Department Staff</small>
                      <h3 className="fw-bold mt-2">{counts.totalStaff}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <h3 className="fw-bold mt-2">{counts.attendancePercent}%</h3>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Actions */}
              <div className="row g-3">

                <div className="col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h5>📘 Attendance</h5>
                      <p className="text-muted">
                        Mark or view attendance easily.
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setActiveTab("attendance")}
                      >
                        Go to Attendance
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h5>📊 Reports</h5>
                      <p className="text-muted">
                        Generate attendance reports.
                      </p>
                      <button
                        className="btn btn-success"
                        onClick={() => setActiveTab("reports")}
                      >
                        View Reports
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* Students */}
          {activeTab === "students" && <ManageStudents restrictedDept={dept} />}

          {/* Staff */}
          {activeTab === "staffs" && <ManageStaffs restrictedDept={dept} />}

          {/* Attendance */}
          {activeTab === "attendance" && <AttendancePage restrictedDept={dept} />}

          {/* Reports */}
          {activeTab === "reports" && <Reports restrictedDept={dept} />}

        </main>
      </div>
    </div>
  );
}