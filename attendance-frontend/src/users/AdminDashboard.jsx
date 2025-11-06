import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import ManageHods from "../Pages/ManageHods";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts } from "../api/dashboardApi"; // ✅ Backend API import

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaffs: 0,
    totalHods: 0,
    attendancePercent: 0,
  });

  // 🎓 CSV Upload & Filter
  const [stuFile, setStuFile] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // 🕒 Live Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 📊 Fetch Dashboard Counts from Backend
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDashboardCounts();
        setCounts(res.data);
      } catch (err) {
        console.error("❌ Error fetching dashboard counts:", err);
      }
    };
    fetchCounts();
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) window.location.href = "/";
  };

  // 📥 Handle CSV Upload
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
          regNo: r.RegNo || r.regno || `R-${idx + 1}`,
          name: r.Name || r.name || "N/A",
          dept: r.Department || r.Dept || r.dept || "N/A",
          year: r.Year || r.year || "N/A",
        }));
        setUploadedStudents(mapped);
        alert("✅ CSV parsed successfully!");
      },
      error: (err) => {
        console.error(err);
        alert("❌ Failed to parse CSV file.");
      },
    });
  };

  // 🎯 Apply & Reset Filters
  const applyStudentFilter = () => {
    let result = uploadedStudents;
    if (filterDept)
      result = result.filter(
        (s) => (s.dept || "").toLowerCase() === filterDept.toLowerCase()
      );
    if (filterYear)
      result = result.filter(
        (s) => (s.year || "").toLowerCase() === filterYear.toLowerCase()
      );
    setFilteredStudents(result);
  };

  const resetStudentFilter = () => {
    setFilterDept("");
    setFilterYear("");
    setFilteredStudents([]);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="flex-grow-1">
        <AdminNavbar now={now} />

        <main className="p-4">
          {/* 🏠 Dashboard */}
          {activeTab === "dashboard" && (
            <section>
              <h3 className="mb-3">Dashboard</h3>

              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small className="text-muted">Total Students</small>
                      <div className="h3 fw-bold mt-2">{counts.totalStudents}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small className="text-muted">Total Staff</small>
                      <div className="h3 fw-bold mt-2">{counts.totalStaffs}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small className="text-muted">Total HODs</small>
                      <div className="h3 fw-bold mt-2">{counts.totalHods}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <small className="text-muted">Today's Attendance</small>
                      <div className="h3 fw-bold mt-2">
                        {counts.attendancePercent || 87}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 🎓 Manage Students */}
          {activeTab === "manageStudents" && (
            <ManageStudents
              stuFile={stuFile}
              setStuFile={setStuFile}
              uploadedStudents={uploadedStudents}
              filteredStudents={filteredStudents}
              filterDept={filterDept}
              setFilterDept={setFilterDept}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              handleStudentUpload={handleStudentUpload}
              applyStudentFilter={applyStudentFilter}
              resetStudentFilter={resetStudentFilter}
            />
          )}

          {/* 👨‍🏫 Manage Staff */}
          {activeTab === "manageStaff" && <ManageStaffs />}

          {/* 🧑‍💼 Manage HOD */}
          {activeTab === "manageHOD" && <ManageHods />}

          {/* 📝 Attendance */}
          {activeTab === "attendance" && <AttendancePage />}

          {/* 📊 Reports */}
          {activeTab === "reports" && <Reports />}
        </main>
      </div>
    </div>
  );
}
