import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";
import ManageStudents from "../Pages/ManageStudents";
import ManageStaffs from "../Pages/ManageStaffs";
import ManageHods from "../Pages/ManageHods";
import AttendancePage from "../Pages/AttendancePage";
import Reports from "../Pages/Reports";
import { getDashboardCounts } from "../api/dashboardApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());

  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalHods: 0,
    attendancePercent: 0,
  });

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

  // 📊 Backend Dashboard Counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDashboardCounts();

        setCounts({
          totalStudents: res.data.totalStudents,
          totalStaff: res.data.totalStaff,
          totalHods: res.data.totalHods,
          attendancePercent: res.data.attendancePercent,
        });

      } catch (err) {
        console.error("❌ Error fetching dashboard counts:", err);
      }
    };

    fetchCounts();
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    if (window.confirm("Logout from admin panel?")) {
      window.location.href = "/";
    }
  };

  // 📥 CSV Upload
  const handleStudentUpload = () => {
    if (!stuFile) {
      alert("Choose CSV file first");
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
        alert("CSV uploaded successfully");
      },
    });
  };

  // 🎯 Apply Filters
  const applyStudentFilter = () => {
    let result = uploadedStudents;

    if (filterDept) {
      result = result.filter(
        (s) => (s.dept || "").toLowerCase() === filterDept.toLowerCase()
      );
    }

    if (filterYear) {
      result = result.filter(
        (s) => (s.year || "").toLowerCase() === filterYear.toLowerCase()
      );
    }

    setFilteredStudents(result);
  };

  // 🔄 Reset Filter
  const resetStudentFilter = () => {
    setFilterDept("");
    setFilterYear("");
    setFilteredStudents([]);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f1f5f9" }}>

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

              <h3 className="fw-bold mb-3">Admin Dashboard</h3>

              {/* Welcome Banner */}
              <div
                className="alert border-0 shadow"
                style={{
                  background: "linear-gradient(90deg,#2563eb,#1e3a8a)",
                  color: "white",
                }}
              >
                <h5>Welcome Admin 👑</h5>
                <p className="mb-0">
                  Manage students, staffs and monitor overall college attendance.
                </p>
              </div>

              {/* Dashboard Cards */}
              <div className="row g-4 mt-2">

                <div className="col-md-3">
                  <div className="card shadow border-0 text-center">
                    <div className="card-body">
                      <h6 className="text-muted">Total Students</h6>
                      <h2 className="fw-bold text-primary">
                        {counts.totalStudents}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card shadow border-0 text-center">
                    <div className="card-body">
                      <h6 className="text-muted">Total Staff</h6>
                      <h2 className="fw-bold text-success">
                        {counts.totalStaff}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card shadow border-0 text-center">
                    <div className="card-body">
                      <h6 className="text-muted">Total HODs</h6>
                      <h2 className="fw-bold text-warning">
                        {counts.totalHods}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card shadow border-0 text-center">
                    <div className="card-body">
                      <h6 className="text-muted">Today's Attendance</h6>
                      <h2 className="fw-bold text-danger">
                        {counts.attendancePercent}%
                      </h2>
                    </div>
                  </div>
                </div>

              </div>

            </section>
          )}

          {/* 🎓 Students */}
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

          {/* 👨‍🏫 Staff */}
          {activeTab === "manageStaff" && <ManageStaffs />}

          {/* 🧑‍💼 HOD */}
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