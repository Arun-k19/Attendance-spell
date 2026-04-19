import React, { useEffect, useState } from "react";
import StaffSidebar from "../components/Staff/StaffSidebar";
import StaffNavbar from "../components/Staff/StaffNavbar";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getStaffDashboardData } from "../api/dashboardApi";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState("all");
  const [staffName, setStaffName] = useState("");
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalClasses: 12,
    attendancePercent: 0,
  });
  const [dept, setDept] = useState("");
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 🕒 Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 🔥 GET USER FROM LOCAL STORAGE
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;

    const user = JSON.parse(raw);
    console.log("STAFF USER:", user);

    // ✅ Try all possible name fields
    const name =
      user.name ||
      user.username ||
      user.fullName ||
      user.full_name ||
      user.staffName ||
      "";

    setStaffName(name);

    if (user.department) {
      setDept(user.department);
    } else {
      console.error("❌ No department found");
    }
  }, []);

  // 🔥 FETCH DATA FROM BACKEND
  useEffect(() => {
    if (dept) {
      getStaffDashboardData(dept)
        .then((res) => {
          console.log("STAFF API:", res.data);
          setData(res.data);
          setCounts({
            totalStudents: res.data.totalStudents || 0,
            totalClasses: res.data.totalClasses || 12,
            attendancePercent: res.data.attendancePercent || 0,
          });
        })
        .catch((err) => {
          console.error("Staff dashboard error:", err);
        });
    }
  }, [dept]);

  // 🔥 Today's date string
  const todayStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 🔥 Filter students
  const filteredStudents = data?.students?.filter((s) => {
    const yearMatch = selectedYear === "all" || s.year === selectedYear;
    const nameMatch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && nameMatch;
  });

  // 🔥 Today's attendance count
  const todayPresent = data?.students?.filter((s) => s.presentToday)?.length || 0;
  const todayAbsent = (data?.students?.length || 0) - todayPresent;

  // 🔥 Year badge colors
  const yearColors = {
    "1": { bg: "#dbeafe", color: "#1e40af" },
    "2": { bg: "#dcfce7", color: "#166534" },
    "3": { bg: "#fef9c3", color: "#854d0e" },
    "4": { bg: "#fce7f3", color: "#9d174d" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      <StaffSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={() => (window.location.href = "/")}
      />

      <div className="staff-main">

        <StaffNavbar now={now} staffName={staffName} />

        <main className="p-4 container-fluid">

          {activeTab === "dashboard" && (
            <section>

              <h3 className="fw-bold mb-1">Staff Dashboard</h3>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                📅 {todayStr}
              </p>

              {/* ✅ BANNER with staff name */}
              <div
                className="shadow-sm p-4 mb-4"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(90deg,#2563eb,#1e40af)",
                  color: "white",
                }}
              >
                <h5 className="fw-bold mb-1">
                  👋 Welcome, {staffName ? staffName : "Staff"}!
                </h5>
                <p className="mb-0" style={{ opacity: 0.85, fontSize: "14px" }}>
                  Manage attendance and view reports efficiently.
                </p>
              </div>

              {/* ✅ STAT CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card text-center border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Total Students</p>
                    <h3 className="fw-bold text-primary mb-0">{counts.totalStudents}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Classes Taken</p>
                    <h3 className="fw-bold text-primary mb-0">{counts.totalClasses}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Avg Attendance</p>
                    <h3 className="fw-bold text-primary mb-0">{counts.attendancePercent}%</h3>
                  </div>
                </div>

                {/* ✅ TODAY'S ATTENDANCE CARD */}
                <div className="col-md-3">
                  <div
                    className="card text-center border-0 shadow-sm p-3"
                    style={{ borderRadius: "14px", background: "#f0fdf4" }}
                  >
                    <p className="mb-1" style={{ fontSize: "13px", color: "#166534" }}>
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
                        <p className="mb-0" style={{ fontSize: "11px", color: "#166534" }}>
                          Present
                        </p>
                      </div>
                      <div style={{ borderLeft: "1px solid #bbf7d0", margin: "4px 0" }} />
                      <div>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "22px", color: "#dc2626" }}
                        >
                          {todayAbsent}
                        </span>
                        <p className="mb-0" style={{ fontSize: "11px", color: "#991b1b" }}>
                          Absent
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ YEAR FILTER - Advanced */}
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
                        selectedYear === y ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                    }}
                  >
                    {y === "all" ? "🔍 All" : `Year ${y}`}
                  </button>
                ))}

                {/* ✅ Student count badge */}
                <span
                  className="ms-2 badge"
                  style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
                    fontSize: "12px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                  }}
                >
                  {filteredStudents?.length || 0} students
                </span>
              </div>

              {/* ✅ STUDENTS + QUICK ACTIONS */}
              <div className="row">

                <div className="col-md-7">
                  <div
                    className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0">Students</h6>
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        {filteredStudents?.length || 0} found
                      </span>
                    </div>

                    {/* ✅ Search box */}
                    <input
                      type="text"
                      className="form-control form-control-sm mb-3"
                      placeholder="🔍 Search student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ borderRadius: "10px" }}
                    />

                    <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                      <ul className="list-group list-group-flush">

                        {filteredStudents?.length === 0 && (
                          <li className="list-group-item text-center text-muted py-4">
                            😕 No students found
                          </li>
                        )}

                        {filteredStudents?.map((s, i) => {
                          const yColor = yearColors[s.year] || yearColors["1"];
                          return (
                            <li
                              key={i}
                              className="list-group-item d-flex justify-content-between align-items-center px-1"
                              style={{ borderLeft: `3px solid ${yColor.color}` }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                {/* Avatar circle */}
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
                                <span style={{ fontSize: "14px" }}>{s.name}</span>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                {/* Today present/absent dot */}
                                <span
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: s.presentToday ? "#16a34a" : "#dc2626",
                                    display: "inline-block",
                                    title: s.presentToday ? "Present" : "Absent",
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
                    </div>
                  </div>
                </div>

                {/* ✅ QUICK ACTIONS */}
                <div className="col-md-5">
                  <div
                    className="card p-3 shadow-sm border-0"
                    style={{ borderRadius: "16px" }}
                  >
                    <h6 className="fw-bold mb-3">Quick Actions</h6>

                    <button
                      className="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                      style={{ borderRadius: "10px", padding: "10px" }}
                      onClick={() => setActiveTab("attendance")}
                    >
                      📘 Take Attendance
                    </button>

                    <button
                      className="btn btn-success w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                      style={{ borderRadius: "10px", padding: "10px" }}
                      onClick={() => setActiveTab("reports")}
                    >
                      📊 View Reports
                    </button>

                    {/* ✅ TODAY's summary box */}
                    <div
                      className="mt-3 p-3"
                      style={{
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <p className="fw-bold mb-2" style={{ fontSize: "13px" }}>
                        📅 Today's Summary
                      </p>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          Present
                        </span>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "13px", color: "#16a34a" }}
                        >
                          {todayPresent} ✅
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          Absent
                        </span>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "13px", color: "#dc2626" }}
                        >
                          {todayAbsent} ❌
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          Total
                        </span>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "13px", color: "#2563eb" }}
                        >
                          {data?.students?.length || 0}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="mt-2"
                        style={{
                          height: "6px",
                          background: "#e2e8f0",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              data?.students?.length
                                ? Math.round(
                                    (todayPresent / data.students.length) * 100
                                  )
                                : 0
                            }%`,
                            height: "100%",
                            background: "#16a34a",
                            borderRadius: "10px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <p
                        className="text-end mb-0 mt-1"
                        style={{ fontSize: "11px", color: "#64748b" }}
                      >
                        {data?.students?.length
                          ? Math.round(
                              (todayPresent / data.students.length) * 100
                            )
                          : 0}
                        % present today
                      </p>
                    </div>
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

// 🔥 CARD COMPONENT (kept for backward compat)
const DashboardCard = ({ title, value }) => (
  <div className="col-md-4">
    <div
      className="card text-center border-0 shadow-sm p-4"
      style={{ borderRadius: "16px" }}
    >
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold text-primary">{value}</h2>
    </div>
  </div>
);