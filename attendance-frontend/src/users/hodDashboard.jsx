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

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get Dept
  useEffect(() => {
    const hodData = JSON.parse(localStorage.getItem("hodData"));
    if (hodData) {
      setDept(hodData.department.toUpperCase());
    }
  }, []);

  // API
  useEffect(() => {
    if (dept) {
      getHODDashboardCounts(dept)
        .then((res) => setCounts(res.data))
        .catch(() =>
          setCounts({
            totalStudents: 120,
            totalStaff: 25,
            attendancePercent: 72,
          })
        );
    }
  }, [dept]);

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.removeItem("hodData");
      window.location.href = "/";
    }
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Sidebar */}
      <HODSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* 🔥 FIXED MAIN CONTENT */}
      <div className="hod-main">

        <HODNavbar now={now} dept={dept} />

        <main className="container-fluid p-4">

          {activeTab === "dashboard" && (
            <>
              <h3 className="fw-bold mb-3">
                {dept} Department Dashboard
              </h3>

              {/* Banner */}
              <div className="card text-white bg-primary shadow-sm mb-4 rounded-4">
                <div className="card-body">
                  <h5 className="fw-bold">Welcome, HOD 👨‍🏫</h5>
                  <p className="mb-0">
                    Manage students, staff and track attendance easily.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="row g-4 mb-4">

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center rounded-4 h-100">
                    <div className="card-body">
                      <small className="text-muted">Students</small>
                      <h2 className="fw-bold text-primary">{counts.totalStudents}</h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center rounded-4 h-100">
                    <div className="card-body">
                      <small className="text-muted">Staff</small>
                      <h2 className="fw-bold text-success">{counts.totalStaff}</h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 text-center rounded-4 h-100">
                    <div className="card-body">
                      <small className="text-muted">Attendance</small>
                      <h2 className="fw-bold text-danger">
                        {counts.attendancePercent}%
                      </h2>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Actions */}
              <div className="row g-4">

                <div className="col-md-6">
                  <div className="card shadow-sm border-0 rounded-4 h-100">
                    <div className="card-body">
                      <h5>📘 Attendance</h5>
                      <p className="text-muted">
                        Mark and manage attendance easily.
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
                  <div className="card shadow-sm border-0 rounded-4 h-100">
                    <div className="card-body">
                      <h5>📊 Reports</h5>
                      <p className="text-muted">
                        Generate department reports.
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
            </>
          )}

          {activeTab === "students" && (
            <ManageStudents restrictedDept={dept} />
          )}

          {activeTab === "staffs" && (
            <ManageStaffs restrictedDept={dept} />
          )}

          {activeTab === "attendance" && (
            <AttendancePage restrictedDept={dept} />
          )}

          {activeTab === "reports" && (
            <Reports restrictedDept={dept} />
          )}

        </main>
      </div>
    </div>
  );
}