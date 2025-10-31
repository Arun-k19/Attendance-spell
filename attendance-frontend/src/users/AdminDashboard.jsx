import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents"; // ✅ imported

/**
 * AdminDashboard.jsx
 * Clean modular admin panel — includes ManageStudents component
 */

export default function AdminDashboard() {
  // ⏱️ State Management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());

  // 🎓 Student Management
  const [stuFile, setStuFile] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [studentsDemo] = useState([
    { regNo: "CSE101", name: "Arun", dept: "CSE", year: "4th", attendance: 80 },
    { regNo: "CSE102", name: "Bala", dept: "CSE", year: "4th", attendance: 70 },
    { regNo: "ECE101", name: "Chitra", dept: "ECE", year: "3rd", attendance: 90 },
  ]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // 👩‍🏫 Staff Management
  const [staffs, setStaffs] = useState([
    { id: 1, name: "Ms. Meena", dept: "CSE", email: "meena@college.edu", phone: "9876500001" },
    { id: 2, name: "Mr. Ravi", dept: "ECE", email: "ravi@college.edu", phone: "9876500002" },
  ]);

  // 🧑‍💼 HOD Management
  const [hods, setHods] = useState([
    { id: 1, name: "Dr. Suresh Kumar", dept: "CSE", email: "suresh@college.edu", phone: "9876543210" },
  ]);

  // 🕒 Update time in navbar
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 🚪 Logout handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/";
    }
  };

  // 📥 CSV Upload (Students)
  const handleStudentUpload = () => {
    if (!stuFile) {
      alert("Please choose a CSV file to upload.");
      return;
    }
    Papa.parse(stuFile, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const mapped = res.data.map((r, idx) => ({
          regNo: r.RegNo || r.regno || r.Reg || `R-${idx + 1}`,
          name: r.Name || r.name || "N/A",
          dept: r.Department || r.Dept || r.dept || "N/A",
          year: r.Year || r.year || "N/A",
        }));
        setUploadedStudents(mapped);
        alert("CSV parsed successfully!");
      },
      error: (err) => {
        console.error(err);
        alert("Failed to parse CSV file.");
      },
    });
  };

  // 🎯 Student filter logic
  const applyStudentFilter = () => {
    const source = uploadedStudents.length ? uploadedStudents : studentsDemo;
    let result = source;
    if (filterDept) result = result.filter((s) => (s.dept || "").toLowerCase() === filterDept.toLowerCase());
    if (filterYear) result = result.filter((s) => (s.year || "").toLowerCase() === filterYear.toLowerCase());
    setFilteredStudents(result);
  };

  const resetStudentFilter = () => {
    setFilterDept("");
    setFilterYear("");
    setFilteredStudents([]);
  };

  // 🧮 Quick dashboard stats
  const totalStudents = uploadedStudents.length ? uploadedStudents.length : studentsDemo.length;
  const totalStaff = staffs.length;
  const totalHods = hods.length;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-grow-1">
        <AdminNavbar now={now} />

        <main className="p-4">
          {/* ---------------- 🏠 DASHBOARD TAB ---------------- */}
          {activeTab === "dashboard" && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Dashboard</h3>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total Students</small>
                      <div className="h3 fw-bold mt-2">{totalStudents}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total Staff</small>
                      <div className="h3 fw-bold mt-2">{totalStaff}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Total HODs</small>
                      <div className="h3 fw-bold mt-2">{totalHods}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <div className="h3 fw-bold mt-2">87%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">Quick Actions</h6>
                  <div className="d-grid gap-2 d-md-flex">
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab("manageStudents")}
                    >
                      Manage Students
                    </button>
                    <button className="btn btn-success" onClick={() => alert("Feature Coming Soon!")}>
                      Create Spell
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => alert("Export Feature Coming Soon!")}>
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ---------------- 🎓 MANAGE STUDENTS TAB ---------------- */}
          {activeTab === "manageStudents" && (
            <ManageStudents
              stuFile={stuFile}
              setStuFile={setStuFile}
              uploadedStudents={uploadedStudents}
              filteredStudents={filteredStudents}
              studentsDemo={studentsDemo}
              filterDept={filterDept}
              setFilterDept={setFilterDept}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              handleStudentUpload={handleStudentUpload}
              applyStudentFilter={applyStudentFilter}
              resetStudentFilter={resetStudentFilter}
            />
          )}

          {/* ---------------- 👩‍🏫 MANAGE STAFF TAB ---------------- */}
          {activeTab === "manageStaff" && (
            <section>
              <h3 className="mb-3">Manage Staff</h3>
              <p className="text-muted">Staff management functionality coming soon.</p>
            </section>
          )}

          {/* ---------------- 🧑‍💼 MANAGE HOD TAB ---------------- */}
          {activeTab === "manageHOD" && (
            <section>
              <h3 className="mb-3">Manage HOD</h3>
              <p className="text-muted">HOD management functionality coming soon.</p>
            </section>
          )}

          {/* ---------------- 📊 REPORTS TAB ---------------- */}
          {activeTab === "reports" && (
            <section>
              <h3 className="mb-3">Reports</h3>
              <p className="text-muted">Reports and analytics section under construction.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
