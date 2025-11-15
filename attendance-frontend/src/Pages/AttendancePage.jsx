import React, { useState, useEffect } from "react";
import { saveAttendance } from "../api/attendanceApi";
import { getStudentsByFilter } from "../api/studentApi";

const AttendancePage = () => {
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("");
  const [subject, setSubject] = useState("");

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  // 🚀 Load Students From Backend
  const loadStudents = async () => {
    if (!department || !year || !period || !subject)
      return alert("Please fill all fields!");

    try {
      const res = await getStudentsByFilter(department, year);

      if (res.data.length === 0) return alert("No students found!");

      setStudents(res.data);

      // DEFAULT: P for all
      const initial = {};
      res.data.forEach((s) => (initial[s.regNo] = "P")); // FIXED
      setAttendance(initial);

      setIsLoaded(true);
      setIsSubmitted(false);
    } catch (err) {
      alert("Failed to load students!");
    }
  };

  const toggleAttendance = (regNo) => {
    if (isSubmitted) return;
    setAttendance((prev) => ({
      ...prev,
      [regNo]: prev[regNo] === "P" ? "A" : "P",
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      date,
      department,
      year: Number(year),
      period: Number(period),
      subject,
      attendance: students.map((s) => ({
        regNo: s.regNo, // FIXED
        status: attendance[s.regNo] === "P" ? "Present" : "Absent",
      })),
    };

    try {
      await saveAttendance(payload);
      alert("Attendance saved!");
      setIsSubmitted(true);
    } catch (err) {
      alert("Failed to save attendance!");
    }
  };

  return (
    <div className="container py-3" style={{ maxWidth: "1100px" }}>
      
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h3 className="fw-bold text-primary">📘 Manage Attendance</h3>

        <input
          type="date"
          className="form-control shadow-sm fw-semibold"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "180px", border: "2px solid #2563eb", borderRadius: "10px" }}
        />
      </div>

      {/* Filters */}
      <div className="card shadow-sm p-3 mb-3 border-0">
        <div className="row g-3">

          <div className="col-md-3">
            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Department</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Year</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">Period</option>
              {[1,2,3,4,5,6,7,8].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Load Btn */}
      {!isLoaded && (
        <button className="btn btn-primary w-100 fw-bold" onClick={loadStudents}>
          🚀 Load Students
        </button>
      )}

      {/* Student List */}
      {isLoaded && (
        <>
          {students.map((s) => (
            <div key={s._id} className="card shadow-sm mb-2 border-0">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <strong>{s.regNo}</strong>
                  <div className="text-muted small">{s.name}</div>
                </div>

                <div
                  onClick={() => toggleAttendance(s.regNo)} // FIXED
                  className={`fw-semibold px-3 py-1 rounded-pill ${
                    attendance[s.regNo] === "P"
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                  style={{ cursor: "pointer", minWidth: "110px", textAlign: "center" }}
                >
                  {attendance[s.regNo] === "P" ? "Present" : "Absent"}
                </div>
              </div>
            </div>
          ))}

          {!isSubmitted ? (
            <button className="btn btn-success w-100 fw-bold mt-3" onClick={handleSubmit}>
              Submit Attendance
            </button>
          ) : (
            <div className="alert alert-success text-center fw-bold mt-3">
              Attendance Submitted!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;
