import React, { useEffect, useState } from "react";
import Papa from "papaparse";

import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";


export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [dept, setDept] = useState(""); // 🔒 For restricting access
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

  // 👤 Fetch HOD Department from localStorage (after login)
  useEffect(() => {
    const hodData = JSON.parse(localStorage.getItem("hodData"));
    if (hodData) setDept(hodData.department); // e.g., "CSE"
  }, []);

  // 📊 Fetch Department-Specific Data
  useEffect(() => {
    if (dept) {
      getHODDashboardCounts(dept)
        .then((res) => setCounts(res.data))
        .catch((err) => console.error("Error fetching HOD counts:", err));
    }
  }, [dept]);

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.removeItem("hodData");
      window.location.href = "/";
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <HODSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <div className="flex-grow-1">
        <HODNavbar now={now} dept={dept} />

        <main className="p-4">
          {/* 🏠 Dashboard */}
          {activeTab === "dashboard" && (
            <section>
              <h3 className="mb-3">{dept} Department Dashboard</h3>

              <div className="row g-3">
                <div className="col-lg-4 col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small>Total Students</small>
                      <h3>{counts.totalStudents}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small>Total Staffs</small>
                      <h3>{counts.totalStaffs}</h3>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small>Attendance Today</small>
                      <h3>{counts.attendancePercent || 0}%</h3>
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
