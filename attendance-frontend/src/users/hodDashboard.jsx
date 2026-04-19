import axios from "axios";
import React, { useEffect, useState } from "react";
import HODSidebar from "../components/Hod/HODSidebar";
import HODNavbar from "../components/Hod/HODNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import {
  getHODDashboardCounts,
  getDepartmentDetails,
} from "../api/dashboardApi";

export default function HodDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [dept, setDept] = useState("");
  const [hodName, setHodName] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [searchStaff, setSearchStaff] = useState("");

  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaff: 0,
    attendancePercent: 0,
  });

  const [deptData, setDeptData] = useState(null);

  // 🕒 Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ GET USER FROM LOCALSTORAGE
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    if (user.department) setDept(user.department);
    const name =
      user.name ||
      user.username ||
      user.fullName ||
      user.full_name ||
      user.hodName ||
      "";
    setHodName(name);
  }, []);

  // ✅ FETCH COUNTS
  useEffect(() => {
    if (!dept) return;
    const fetchCounts = async () => {
      try {
        const res = await getHODDashboardCounts(dept);
        setCounts(res.data);
      } catch (err) {
        console.error("Counts error:", err);
      }
    };
    fetchCounts();
  }, [dept]);

  // ✅ FETCH FULL DEPARTMENT DATA
  useEffect(() => {
    if (!dept) return;
    const fetchDept = async () => {
      try {
        const res = await getDepartmentDetails(dept);
        setDeptData(res.data);
      } catch (err) {
        console.error("Dept error:", err);
      }
    };
    fetchDept();
  }, [dept]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const todayStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const yearColors = {
    "1": { bg: "#dbeafe", color: "#1e40af" },
    "2": { bg: "#dcfce7", color: "#166534" },
    "3": { bg: "#fef9c3", color: "#854d0e" },
    "4": { bg: "#fce7f3", color: "#9d174d" },
  };

  const filteredStudents =
    deptData?.students?.filter((s) => {
      const yearMatch =
        selectedYear === "all" || String(s.year) === String(selectedYear);
      const nameMatch = s.name
        ?.toLowerCase()
        .includes(searchStudent.toLowerCase());
      return yearMatch && nameMatch;
    }) ?? [];

  const filteredStaff =
    deptData?.staff?.filter((s) =>
      s.name?.toLowerCase().includes(searchStaff.toLowerCase())
    ) ?? [];

  const todayPresent =
    deptData?.students?.filter((s) => s.presentToday)?.length || 0;
  const todayAbsent = (deptData?.students?.length || 0) - todayPresent;

 

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <HODSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="hod-main">
        <HODNavbar now={now} dept={dept} hodName={hodName} />

        <main className="container-fluid p-4">
          {activeTab === "dashboard" && (
            <>
              <h3 className="fw-bold mb-1">{dept} Department Dashboard</h3>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                📅 {todayStr}
              </p>

              {/* ✅ BANNER */}
              <div
                className="shadow-sm p-4 mb-4"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(90deg,#2563eb,#1e40af)",
                  color: "white",
                }}
              >
                <h5 className="fw-bold mb-1">
                  👋 Welcome, {hodName ? hodName : "HOD"}!
                </h5>
                <p className="mb-0" style={{ opacity: 0.85, fontSize: "14px" }}>
                  Manage students, staff and track attendance for{" "}
                  <strong>{dept}</strong> department.
                </p>
              </div>

              {/* ✅ STAT CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div
                    className="card text-center border-0 shadow-sm p-3"
                    style={{ borderRadius: "14px" }}
                  >
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                      Total Students
                    </p>
                    <h3 className="fw-bold text-primary mb-0">
                      {counts.totalStudents}
                    </h3>
                    <small className="text-muted">{dept} Dept</small>
                  </div>
                </div>

                <div className="col-md-3">
                  <div
                    className="card text-center border-0 shadow-sm p-3"
                    style={{ borderRadius: "14px" }}
                  >
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                      Total Staff
                    </p>
                    <h3 className="fw-bold text-success mb-0">
                      {counts.totalStaff}
                    </h3>
                    <small className="text-muted">{dept} Dept</small>
                  </div>
                </div>

                <div className="col-md-3">
                  <div
                    className="card text-center border-0 shadow-sm p-3"
                    style={{ borderRadius: "14px" }}
                  >
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                      Avg Attendance
                    </p>
                    <h3 className="fw-bold text-danger mb-0">
                      {counts.attendancePercent}%
                    </h3>
                    <small className="text-muted">Overall</small>
                  </div>
                </div>

                {/* ✅ TODAY CARD */}
                <div className="col-md-3">
                  <div
                    className="card text-center border-0 shadow-sm p-3"
                    style={{ borderRadius: "14px", background: "#f0fdf4" }}
                  >
                    <p
                      className="mb-1"
                      style={{ fontSize: "13px", color: "#166534" }}
                    >
                      Today's Attendance
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <div>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "22px", color: "#16a34a" }}
                        >
                          {todayPresent}
                        </span>
                        <p
                          className="mb-0"
                          style={{ fontSize: "11px", color: "#166534" }}
                        >
                          Present
                        </p>
                      </div>
                      <div
                        style={{
                          borderLeft: "1px solid #bbf7d0",
                          margin: "4px 0",
                        }}
                      />
                      <div>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "22px", color: "#dc2626" }}
                        >
                          {todayAbsent}
                        </span>
                        <p
                          className="mb-0"
                          style={{ fontSize: "11px", color: "#991b1b" }}
                        >
                          Absent
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ YEAR FILTER */}
              <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span className="text-muted" style={{ fontSize: "13px" }}>
                  Filter by Year:
                </span>
                {["all", "1", "2", "3", "4"].map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    style={{
                      borderRadius: "20px",
                      padding: "5px 16px",
                      fontSize: "13px",
                      fontWeight: selectedYear === y ? "600" : "400",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background:
                        selectedYear === y
                          ? y === "all"
                            ? "#2563eb"
                            : yearColors[y]?.bg
                          : "#e2e8f0",
                      color:
                        selectedYear === y
                          ? y === "all"
                            ? "white"
                            : yearColors[y]?.color
                          : "#64748b",
                      boxShadow:
                        selectedYear === y
                          ? "0 2px 8px rgba(0,0,0,0.12)"
                          : "none",
                    }}
                  >
                    {y === "all" ? "🔍 All" : `Year ${y}`}
                  </button>
                ))}
                <span
                  style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
                    fontSize: "12px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                  }}
                >
                  {filteredStudents.length} students
                </span>
              </div>

              {/* ✅ STUDENTS + STAFF */}
              <div className="row g-4">

                {/* STUDENTS */}
                <div className="col-md-6">
                  <div
                    className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">
                        Students
                        <span className="badge bg-primary ms-2" style={{ fontSize: "11px" }}>
                          {filteredStudents.length}
                        </span>
                      </h6>
                      <small className="text-muted">{dept} Dept</small>
                    </div>

                    <input
                      type="text"
                      className="form-control form-control-sm mb-3"
                      placeholder="🔍 Search student..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      style={{ borderRadius: "10px" }}
                    />

                    <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                      {filteredStudents.length === 0 ? (
                        <p className="text-muted text-center py-4">
                          😕 No students found
                        </p>
                      ) : (
                        <ul className="list-group list-group-flush">
                          {filteredStudents.map((s, i) => {
                            const yColor =
                              yearColors[String(s.year)] || yearColors["1"];
                            return (
                              <li
                                key={i}
                                className="list-group-item d-flex justify-content-between align-items-center px-1"
                                style={{ borderLeft: `3px solid ${yColor.color}` }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      background: yColor.bg,
                                      color: yColor.color,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "600",
                                      fontSize: "13px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {s.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontSize: "14px" }}>
                                    {s.name}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: s.presentToday
                                        ? "#16a34a"
                                        : "#dc2626",
                                      display: "inline-block",
                                    }}
                                  />
                                  <span
                                    style={{
                                      background: yColor.bg,
                                      color: yColor.color,
                                      padding: "2px 10px",
                                      borderRadius: "20px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    Year {s.year}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ STAFF + QUICK ACTIONS */}
                <div className="col-md-6">
                  <div
                    className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">
                        Staff
                        <span className="badge bg-success ms-2" style={{ fontSize: "11px" }}>
                          {filteredStaff.length}
                        </span>
                      </h6>
                      <small className="text-muted">{dept} Dept</small>
                    </div>

                    <input
                      type="text"
                      className="form-control form-control-sm mb-3"
                      placeholder="🔍 Search staff..."
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                      style={{ borderRadius: "10px" }}
                    />

                    <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {filteredStaff.length === 0 ? (
                        <p className="text-muted text-center py-3">
                          😕 No staff found
                        </p>
                      ) : (
                        <ul className="list-group list-group-flush">
                          {filteredStaff.map((s, i) => (
                            <li
                              key={i}
                              className="list-group-item d-flex align-items-center gap-2 px-1"
                              style={{ borderLeft: "3px solid #16a34a" }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "#dcfce7",
                                  color: "#166534",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "600",
                                  fontSize: "13px",
                                  flexShrink: 0,
                                }}
                              >
                                {s.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="mb-0" style={{ fontSize: "14px" }}>
                                  {s.name}
                                </p>
                                {s.subject && (
                                  <small className="text-muted">{s.subject}</small>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                   
                  </div>
                </div>
              </div>

              {/* ✅ TODAY SUMMARY BAR */}
              <div
                className="mt-4 p-3 shadow-sm"
                style={{
                  borderRadius: "14px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-bold mb-0" style={{ fontSize: "13px" }}>
                    📅 Today's Attendance Summary
                  </p>
                  <small className="text-muted">
                    {deptData?.students?.length || 0} total students
                  </small>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        deptData?.students?.length
                          ? Math.round(
                              (todayPresent / deptData.students.length) * 100
                            )
                          : 0
                      }%`,
                      height: "100%",
                      background: "linear-gradient(90deg,#16a34a,#22c55e)",
                      borderRadius: "10px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small style={{ color: "#16a34a", fontWeight: "600" }}>
                    ✅ Present: {todayPresent}
                  </small>
                  <small style={{ color: "#64748b" }}>
                    {deptData?.students?.length
                      ? Math.round(
                          (todayPresent / deptData.students.length) * 100
                        )
                      : 0}
                    % present today
                  </small>
                  <small style={{ color: "#dc2626", fontWeight: "600" }}>
                    ❌ Absent: {todayAbsent}
                  </small>
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
          {activeTab === "reports" && <Reports restrictedDept={dept} />}
        </main>
      </div>
    </div>
  );
}