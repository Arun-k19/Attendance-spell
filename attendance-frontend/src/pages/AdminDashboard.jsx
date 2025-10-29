import React, { useState, useEffect } from "react";
import Papa from "papaparse";

function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard or manageStudents
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);

  // Dummy data for demo
  const students = [
    { regNo: "CSE101", name: "Arun", dept: "CSE", year: "4th", attendance: 80 },
    { regNo: "CSE102", name: "Bala", dept: "CSE", year: "4th", attendance: 70 },
    { regNo: "ECE101", name: "Chitra", dept: "ECE", year: "3rd", attendance: 90 },
  ];

  const totalStudents = students.length;
  const totalStaff = 10; // demo
  const totalSpells = 3; // demo
  const todayAttendance = Math.round(
    students.reduce((acc, s) => acc + s.attendance, 0) / totalStudents
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    alert("Logout Success!");
    window.location.href = "/";
  };

  const handleUpload = () => {
    if (!file || !selectedYear || !selectedDept) {
      alert("Select year, department and file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const filtered = results.data.filter((s) => s.Year && s.Department);
        const mapped = filtered.map((s) => ({
          regNo: s.RegNo || "N/A",
          name: s.Name || "N/A",
          dept: s.Department || selectedDept,
          year: s.Year || selectedYear,
        }));
        setUploadedStudents(mapped);
      },
    });
    alert("File uploaded successfully (frontend preview only)");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", backgroundColor: "#343a40", color: "#fff", padding: "1rem" }}>
        <h4 className="fw-bold mb-4">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button
              className="btn btn-link text-white fw-semibold"
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button
              className="btn btn-link text-white fw-semibold"
              onClick={() => setActiveTab("manageStudents")}
            >
              Manage Students
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Manage Staff</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Attendance</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Reports</button>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-danger fw-bold d-flex align-items-center" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "2rem", padding: "1rem", backgroundColor: "#ffffff",
          borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          <div>
            <h2 className="fw-bold mb-0">Welcome, Admin</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ padding: "0.5rem 1rem", backgroundColor: "#e9ecef", borderRadius: "8px", fontWeight: "bold" }}>
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
            <button className="btn btn-danger d-flex align-items-center" onClick={handleLogout} style={{ fontWeight: "bold", gap: "0.5rem" }}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>

        {/* Conditional Rendering */}
        {activeTab === "dashboard" && (
          <>
            {/* Quick Stats */}
            <div className="d-flex flex-wrap mb-4" style={{ gap: "1rem" }}>
              <div className="card shadow-lg p-3 text-white" style={{ backgroundColor: "#0d6efd", flex: "1 1 200px" }}>
                <h5>Total Students</h5>
                <h3>{totalStudents}</h3>
              </div>
              <div className="card shadow-lg p-3 text-white" style={{ backgroundColor: "#198754", flex: "1 1 200px" }}>
                <h5>Total Staff</h5>
                <h3>{totalStaff}</h3>
              </div>
              <div className="card shadow-lg p-3 text-white" style={{ backgroundColor: "#ffc107", flex: "1 1 200px" }}>
                <h5>Total Spells</h5>
                <h3>{totalSpells}</h3>
              </div>
              <div className="card shadow-lg p-3 text-white" style={{ backgroundColor: "#dc3545", flex: "1 1 200px" }}>
                <h5>Today's Attendance %</h5>
                <h3>{todayAttendance}%</h3>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="card shadow-lg p-3 mb-4">
              <h5 className="fw-bold mb-3">Student Attendance</h5>
              <div style={{ overflowX: "auto" }}>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.regNo}</td>
                        <td>{s.name}</td>
                        <td>{s.dept}</td>
                        <td>{s.year}</td>
                        <td style={{ color: s.attendance < 75 ? "red" : "green", fontWeight: "bold" }}>{s.attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "manageStudents" && (
          <div className="card shadow-lg p-3">
            <h5 className="fw-bold mb-3">Manage Students</h5>
            <div className="mb-3 d-flex gap-2 flex-wrap">
              <select className="form-select" style={{ width: "150px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">Year</option>
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
              </select>
              <select className="form-select" style={{ width: "150px" }} value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">Department</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>MECH</option>
                <option>CIVIL</option>
              </select>
              <input type="file" className="form-control" style={{ width: "300px" }} onChange={(e) => setFile(e.target.files[0])} />
              <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedStudents.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.regNo}</td>
                      <td>{s.name}</td>
                      <td>{s.dept}</td>
                      <td>{s.year}</td>
                    </tr>
                  ))}
                  {uploadedStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No students uploaded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
