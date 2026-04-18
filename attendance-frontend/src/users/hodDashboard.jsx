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
  const [selectedYear, setSelectedYear] = useState("all");

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

  // ✅ SET DEPARTMENT FROM LOGIN
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.department) return;

    setDept(user.department); // 🔥 ONLY THIS
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

  // ✅ FILTERS
  const filteredStudents =
    deptData?.students?.filter((s) =>
      selectedYear === "all"
        ? true
        : String(s.year) === String(selectedYear)
    ) ?? [];

  const filteredStaff = deptData?.staff ?? [];

  return (
    <div className="bg-light min-vh-100">
      <HODSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="hod-main">
        <HODNavbar now={now} dept={dept} />

        <main className="container-fluid p-4">
          {activeTab === "dashboard" && (
            <>
              <h3 className="fw-bold mb-3">
                {dept} Department Dashboard
              </h3>

              <div className="card text-white bg-primary shadow-sm mb-4 rounded-4">
                <div className="card-body">
                  <h5 className="fw-bold">Welcome, HOD 👨‍🏫</h5>
                  <p className="mb-0">
                    Manage students, staff and track attendance easily.
                  </p>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="card text-center p-4 rounded-4 shadow-sm">
                    <small className="text-muted">
                      {dept} Students
                    </small>
                    <h2 className="text-primary fw-bold">
                      {counts.totalStudents}
                    </h2>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-center p-4 rounded-4 shadow-sm">
                    <small className="text-muted">
                      {dept} Staff
                    </small>
                    <h2 className="text-success fw-bold">
                      {counts.totalStaff}
                    </h2>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-center p-4 rounded-4 shadow-sm">
                    <small className="text-muted">
                      {dept} Attendance
                    </small>
                    <h2 className="text-danger fw-bold">
                      {counts.attendancePercent}%
                    </h2>
                  </div>
                </div>
              </div>

              {/* YEAR FILTER */}
              <div className="mb-3">
                {["all", "1", "2", "3", "4"].map((y) => (
                  <button
                    key={y}
                    className={`btn me-2 ${
                      selectedYear === y
                        ? "btn-primary"
                        : "btn-light"
                    }`}
                    style={{ borderRadius: "20px" }}
                    onClick={() => setSelectedYear(y)}
                  >
                    {y === "all" ? "All" : `${y} Year`}
                  </button>
                ))}
              </div>

              <div className="row g-4">
                {/* STUDENTS */}
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm rounded-4">
                    <h6 className="fw-bold mb-1">
                      Students
                      <span className="badge bg-primary ms-2">
                        {filteredStudents.length}
                      </span>
                    </h6>
                    <small className="text-muted mb-3 d-block">
                      {dept} Department
                    </small>

                    {filteredStudents.length === 0 ? (
                      <p className="text-muted text-center">
                        No students found
                      </p>
                    ) : (
                      <ul className="list-group">
                        {filteredStudents.map((s, i) => (
                          <li key={i} className="list-group-item">
                            {s.name} - Y{s.year}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* STAFF */}
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm rounded-4">
                    <h6 className="fw-bold mb-1">
                      Staff
                      <span className="badge bg-success ms-2">
                        {filteredStaff.length}
                      </span>
                    </h6>
                    <small className="text-muted mb-3 d-block">
                      {dept} Department
                    </small>

                    {filteredStaff.length === 0 ? (
                      <p className="text-muted text-center">
                        No staff found
                      </p>
                    ) : (
                      <ul className="list-group">
                        {filteredStaff.map((s, i) => (
                          <li key={i} className="list-group-item">
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
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