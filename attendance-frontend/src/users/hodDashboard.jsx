import React, { useState, useEffect } from "react";
import { Table, Button, Card } from "react-bootstrap";

const HodDashboard = () => {
  // HOD Info
  const [hodName] = useState("Dr. Fizal Das");
  const [department] = useState("CSE");

  // Staff & attendance
  const [staffList, setStaffList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Student attendance records
  const [studentAttendance, setStudentAttendance] = useState([]);

  // Quick stats dummy data
  const totalStudents = 50;
  const totalStaff = 10;
  const totalSpells = 3;
  const todayAttendance = 85;

  // Load dummy data
  useEffect(() => {
    setStaffList([
      { id: 1, name: "Mr. Aravind", subject: "Data Structures" },
      { id: 2, name: "Ms. Priya", subject: "Operating Systems" },
      { id: 3, name: "Mr. Vignesh", subject: "DBMS" },
    ]);

    setAttendanceRecords([
      { id: 101, date: "2025-10-20", staff: "Mr. Aravind", status: "Pending" },
      { id: 102, date: "2025-10-21", staff: "Ms. Priya", status: "Approved" },
    ]);

    setStudentAttendance([
      { id: 1, name: "Alice", totalClasses: 20, attended: 18 },
      { id: 2, name: "Bob", totalClasses: 20, attended: 15 },
      { id: 3, name: "Charlie", totalClasses: 20, attended: 20 },
    ]);
  }, []);

  const handleApprove = (id) => {
    setAttendanceRecords(attendanceRecords.map((rec) =>
      rec.id === id ? { ...rec, status: "Approved" } : rec
    ));
  };

  const calculatePercentage = (attended, total) => ((attended / total) * 100).toFixed(2);

  const downloadReport = () => {
    const csvRows = [
      ["ID", "Student Name", "Total Classes", "Attended", "Attendance %"],
      ...studentAttendance.map((s) => [
        s.id,
        s.name,
        s.totalClasses,
        s.attended,
        calculatePercentage(s.attended, s.totalClasses) + "%",
      ]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_attendance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", backgroundColor: "#343a40", color: "#fff", padding: "1rem" }}>
        <h4 className="fw-bold mb-4">HOD Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold w-100 text-start">Dashboard</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold w-100 text-start">Staff List</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold w-100 text-start">Attendance</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold w-100 text-start">Student Records</button>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-danger fw-bold d-flex align-items-center w-100">
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
          <h2 className="fw-bold mb-0">Welcome, {hodName}</h2>
          <span className="bg-light px-3 py-2 rounded fw-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Quick Stats */}
        <div className="d-flex flex-wrap mb-4" style={{ gap: "1rem" }}>
          <div className="text-white p-3 rounded shadow" style={{ backgroundColor: "#0d6efd", flex: "1 1 200px", textAlign: "center" }}>
            <h5>Total Students</h5>
            <h3>{totalStudents}</h3>
          </div>
          <div className="text-white p-3 rounded shadow" style={{ backgroundColor: "#198754", flex: "1 1 200px", textAlign: "center" }}>
            <h5>Total Staff</h5>
            <h3>{totalStaff}</h3>
          </div>
          <div className="text-white p-3 rounded shadow" style={{ backgroundColor: "#ffc107", flex: "1 1 200px", textAlign: "center" }}>
            <h5>Total Spells</h5>
            <h3>{totalSpells}</h3>
          </div>
          <div className="text-white p-3 rounded shadow" style={{ backgroundColor: "#dc3545", flex: "1 1 200px", textAlign: "center" }}>
            <h5>Today's Attendance %</h5>
            <h3>{todayAttendance}%</h3>
          </div>
        </div>

        {/* Staff List */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white fw-bold">Department Staff List</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.subject}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Staff Attendance */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-success text-white fw-bold">Staff Attendance Approvals</Card.Header>
          <Card.Body>
            <Table bordered hover responsive>
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec, idx) => (
                  <tr key={rec.id}>
                    <td>{idx + 1}</td>
                    <td>{rec.date}</td>
                    <td>{rec.staff}</td>
                    <td>
                      <span className={`badge ${rec.status === "Approved" ? "bg-success" : "bg-warning text-dark"}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      {rec.status === "Pending" && (
                        <Button size="sm" variant="outline-success" onClick={() => handleApprove(rec.id)}>
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Student Attendance */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-info text-white fw-bold">Student Attendance Records</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="table-info">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Total Classes</th>
                  <th>Attended</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {studentAttendance.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.totalClasses}</td>
                    <td>{s.attended}</td>
                    <td style={{ color: calculatePercentage(s.attended, s.totalClasses) < 75 ? "red" : "green", fontWeight: "bold" }}>
                      {calculatePercentage(s.attended, s.totalClasses)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="primary" onClick={downloadReport} className="mt-2">Download Report CSV</Button>
          </Card.Body>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted mt-4">
          <small>© 2025 Attendance Management System | HOD Panel</small>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
