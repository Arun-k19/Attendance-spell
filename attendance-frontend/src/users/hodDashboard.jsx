import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import HODSidebar from "../components/HOD/HODSidebar";
import HODNavbar from "../components/HOD/HODNavbar";
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
    totalStaffs: 0,
    attendancePercent: 0,
  });

  // 🕒 Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 👤 Fetch HOD Department
  useEffect(() => {
    const hodData = JSON.parse(localStorage.getItem("hodData"));
    if (hodData) setDept(hodData.department);
  }, []);

  // 📊 Fetch Dashboard Data
  useEffect(() => {
    if (dept) {
      getHODDashboardCounts(dept)
        .then((res) => setCounts(res.data))
        .catch((err) => console.error("Error fetching HOD counts:", err));
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
      <HODSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <div className="flex-grow-1">
        <HODNavbar now={now} dept={dept} />

        <main className="p-4">
          {/* 🏠 Dashboard */}
          {activeTab === "dashboard" && (
            <section>
              <h3 className="mb-3">{dept} Department Dashboard</h3>

              <div
                className="alert alert-primary shadow-sm border-0"
                style={{ background: "linear-gradient(90deg, #2563eb, #1e3a8a)", color: "white" }}
              >
                <h5 className="mb-1">Welcome, HOD!</h5>
                <p className="mb-0">
                  Here you can manage your department’s students, staff, and track attendance progress easily.
                </p>
              </div>

              <div className="row g-3 mt-4 mb-4">
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Department Students</small>
                      <h3 className="fw-bold mt-2">{counts.totalStudents || 0}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Total Staffs</small>
                      <h3 className="fw-bold mt-2">{counts.totalStaffs || 0}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="card shadow-sm border-0 text-center">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <h3 className="fw-bold mt-2">{counts.attendancePercent || 0}%</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h5>📘 Attendance</h5>
                      <p className="text-muted mb-2">
                        Mark or view student attendance for your department efficiently.
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
                      <p className="text-muted mb-2">
                        Generate, analyze, and export department-wise attendance reports.
                      </p>
                      <button
                        className="btn btn-primary"
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

          {/* 🎓 Students */}
          {activeTab === "students" && <ManageStudents restrictedDept={dept} />}

          {/* 👨‍🏫 Staffs */}
          {activeTab === "staffs" && <ManageStaffs restrictedDept={dept} />}

          {/* 📝 Attendance */}
          {activeTab === "attendance" && <AttendancePage restrictedDept={dept} />}

          {/* 📊 Reports */}
          {activeTab === "reports" && <Reports restrictedDept={dept} />}
        </main>
      </div>
    </div>
  );
}
