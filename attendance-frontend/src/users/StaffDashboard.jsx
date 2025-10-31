import React, { useState, useEffect } from "react";

// Utility to get all days of current month
const getMonthDays = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

function StaffDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [students, setStudents] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const allStudents = [
    { regNo: "CSE401", name: "Arun", dept: "CSE", year: "4th", attendance: 80 },
    { regNo: "CSE402", name: "Bala", dept: "CSE", year: "4th", attendance: 70 },
    { regNo: "ECE301", name: "Chitra", dept: "ECE", year: "3rd", attendance: 90 },
  ];

  const totalStudents = allStudents.length;
  const todayAttendance = Math.round(
    allStudents.reduce((acc, s) => acc + s.attendance, 0) / totalStudents
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    alert("Logout Success!");
    window.location.href = "/";
  };

  const handleFilter = () => {
    if (!selectedYear || !selectedDept || !subjectInput) {
      alert("Select Year, Department, and enter Subject");
      return;
    }
    const filtered = allStudents.filter(
      (s) => s.year === selectedYear && s.dept === selectedDept
    );
    setStudents(
      filtered.map((s) => ({
        ...s,
        attendanceStatus: selectedDate.getDay() === 0 ? "Holiday" : "Present",
      }))
    );
    setSubmitted(false);
  };

  const markAttendance = (regNo, status) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.regNo === regNo ? { ...s, attendanceStatus: status } : s
      )
    );
  };

  const handleSubmit = () => {
    alert(
      `Attendance for "${subjectInput}" on ${selectedDate.toLocaleDateString()} submitted!`
    );
    setSubmitted(true);
  };

  const calculateSpell = (att) => {
    return att >= 75 ? "Safe" : "Warning";
  };

  const monthDays = getMonthDays(selectedDate.getFullYear(), selectedDate.getMonth());

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#343a40",
          color: "#fff",
          padding: "1rem",
        }}
      >
        <h4 className="fw-bold mb-4">Staff Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Dashboard</button>
          </li>
          <li className="nav-item mb-2">
            <button
              className="btn btn-link text-white fw-semibold"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              Calendar
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Spell Calculation</button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-link text-white fw-semibold">Attendance Reports</button>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-danger fw-bold" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        {/* Header Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">Welcome, Staff</h2>
            <span
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e9ecef",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="d-flex flex-wrap mb-4" style={{ gap: "1rem" }}>
          <div className="card shadow-sm p-3 text-white" style={{ backgroundColor: "#0d6efd", flex: "1 1 200px" }}>
            <h5>Total Students</h5>
            <h3>{totalStudents}</h3>
          </div>
          <div className="card shadow-sm p-3 text-white" style={{ backgroundColor: "#198754", flex: "1 1 200px" }}>
            <h5>Today's Attendance %</h5>
            <h3>{todayAttendance}%</h3>
          </div>
        </div>

        {/* Calendar Section */}
        {showCalendar && (
          <div className="card shadow-sm border-0 mb-3 p-3">
            <h5 className="fw-bold mb-3">Select Date</h5>
            <div className="d-flex gap-2 flex-wrap">
              {monthDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`btn ${day.getDay() === 0 ? "btn-secondary" : "btn-outline-primary"}`}
                  style={{
                    width: "40px",
                    fontWeight: selectedDate.toDateString() === day.toDateString() ? "bold" : "normal",
                    border: selectedDate.toDateString() === day.toDateString() ? "2px solid #0d6efd" : "",
                    opacity: day.getDay() === 0 ? 0.5 : 1,
                  }}
                  disabled={day.getDay() === 0}
                  onClick={() => setSelectedDate(day)}
                >
                  {day.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <select
            className="form-select"
            style={{ width: "120px" }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Year</option>
            <option>1st</option>
            <option>2nd</option>
            <option>3rd</option>
            <option>4th</option>
          </select>
          <select
            className="form-select"
            style={{ width: "120px" }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">Department</option>
            <option>CSE</option>
            <option>ECE</option>
            <option>MECH</option>
            <option>CIVIL</option>
          </select>
          <input
            type="text"
            className="form-control"
            style={{ width: "150px" }}
            placeholder="Enter Subject"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleFilter}>
            Show Students
          </button>
        </div>

        {/* Attendance Table */}
        <div className="card shadow-sm border-0 p-3 mb-3">
          <h5 className="fw-bold mb-3">
            Mark Attendance for {selectedDate.toLocaleDateString()}
          </h5>
          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Spell</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No students selected</td>
                  </tr>
                )}
                {students.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.regNo}</td>
                    <td>{s.name}</td>
                    <td className="d-flex gap-2">
                      {s.attendanceStatus === "Holiday" ? (
                        <span className="text-muted">Holiday</span>
                      ) : (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => markAttendance(s.regNo, "Present")}
                          >
                            Present
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => markAttendance(s.regNo, "Absent")}
                          >
                            Absent
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => markAttendance(s.regNo, "Leave")}
                          >
                            Leave
                          </button>
                        </>
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: "bold",
                        color:
                          s.attendanceStatus === "Absent"
                            ? "red"
                            : s.attendanceStatus === "Leave"
                            ? "orange"
                            : "green",
                      }}
                    >
                      {s.attendanceStatus === "Holiday" ? "Holiday" : calculateSpell(s.attendance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length > 0 && !submitted && (
            <button className="btn btn-primary mt-3" onClick={handleSubmit}>
              Submit Attendance
            </button>
          )}
          {submitted && (
            <div className="text-success mt-2">Attendance submitted successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
