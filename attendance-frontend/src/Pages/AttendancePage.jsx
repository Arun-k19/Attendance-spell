import React, { useState, useEffect } from "react";

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
  const [lockedPeriods, setLockedPeriods] = useState([]);
  const [showTodaySummary, setShowTodaySummary] = useState(false);
  const [showToast, setShowToast] = useState(null);

  // Public holidays
  const holidays = ["2025-01-26", "2025-08-15", "2025-10-02", "2025-12-25"];

  // Auto set today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Load locked periods
  useEffect(() => {
    if (department && year && date) {
      const key = `${department}_${year}_${date}`;
      const saved = JSON.parse(localStorage.getItem("attendanceLocks") || "{}");
      setLockedPeriods(saved[key] || []);
    }
  }, [department, year, date]);

  const showAlert = (message, type = "info") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 2500);
  };

  // Demo Data
  const studentData = {
    CSE: {
      "1": [
        { roll: "CSE11", name: "Ajay" },
        { roll: "CSE12", name: "Mithra" },
      ],
      "2": [
        { roll: "CSE21", name: "Hari" },
        { roll: "CSE22", name: "Priya" },
      ],
      "3": [
        { roll: "CSE31", name: "Deepa" },
        { roll: "CSE32", name: "Suresh" },
      ],
      "4": [
        { roll: "CSE41", name: "Arun Kumar" },
        { roll: "CSE42", name: "Divya" },
        { roll: "CSE43", name: "Karthik" },
        { roll: "CSE44", name: "Priya" },
      ],
    },
    ECE: { "4": [{ roll: "ECE41", name: "Vignesh" }] },
    EEE: { "4": [{ roll: "EEE41", name: "Bala" }] },
    MECH: { "4": [{ roll: "ME41", name: "Surya" }] },
    CIVIL: { "4": [{ roll: "CV41", name: "Dinesh" }] },
  };

  const loadStudents = () => {
    if (holidays.includes(date)) {
      return showAlert("🎌 Today is a Government Holiday!", "danger");
    }

    if (new Date(date).getDay() === 0) {
      return showAlert("🚫 Sunday is not a working day!", "danger");
    }

    if (!department || !year || !period || !subject) {
      return showAlert("Please fill all fields!", "danger");
    }

    if (lockedPeriods.includes(Number(period))) {
      return showAlert(`Period ${period} already submitted!`, "warning");
    }

    const list = studentData[department]?.[year];
    if (!list) return showAlert("No student data found!", "danger");

    const initial = {};
    list.forEach((s) => (initial[s.roll] = "P"));
    setStudents(list);
    setAttendance(initial);
    setIsLoaded(true);
    showAlert("Students Loaded!", "success");
  };

  const toggleAttendance = (roll) => {
    if (isSubmitted) return;
    setAttendance((prev) => ({
      ...prev,
      [roll]: prev[roll] === "P" ? "A" : "P",
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const key = `${department}_${year}_${date}`;
    const savedLocks = JSON.parse(localStorage.getItem("attendanceLocks") || "{}");
    const updatedLocks = {
      ...savedLocks,
      [key]: [...new Set([...(savedLocks[key] || []), Number(period)])],
    };
    localStorage.setItem("attendanceLocks", JSON.stringify(updatedLocks));

    const savedData = JSON.parse(localStorage.getItem("attendanceData") || "{}");
    const updatedData = {
      ...savedData,
      [key]: {
        ...(savedData[key] || {}),
        [period]: { subject, attendance },
      },
    };
    localStorage.setItem("attendanceData", JSON.stringify(updatedData));

    showAlert(`Attendance for Period ${period} Submitted!`, "success");
  };

  const availablePeriods = [1, 2, 3, 4, 5, 6, 7, 8].filter(
    (p) => !lockedPeriods.includes(p)
  );

  return (
    <div className="container py-3" style={{ maxWidth: "1100px" }}>
      
      {/* PAGE HEADER */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h3 className="fw-bold text-primary">📘 Manage Attendance</h3>

        <input
          type="date"
          className="form-control shadow-sm fw-semibold"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: "180px",
            border: "2px solid #2563eb",
            borderRadius: "10px",
          }}
        />
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className={`alert alert-${showToast.type} position-fixed top-0 end-0 mt-3 me-3 shadow`}
          style={{ zIndex: 5000, fontWeight: "600" }}
        >
          {showToast.message}
        </div>
      )}

      {/* FILTER CARD */}
      <div
        className="card shadow-sm p-3 mb-3 border-0"
        style={{ borderRadius: "12px" }}
      >
        <div className="row g-3">
          <div className="col-md-3">
            <select
              className="form-select shadow-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Department</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Year</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">Period</option>
              {availablePeriods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="col-md-5">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Enter Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!isLoaded && (
        <button
          className="btn shadow-sm mb-3 w-100 text-white fw-bold"
          style={{
            background: "linear-gradient(90deg, #2563eb, #1e3a8a)",
          }}
          onClick={loadStudents}
        >
          🚀 Start Attendance
        </button>
      )}

      {/* Student List */}
      {students.length > 0 && (
        <div>
          {students.map((s) => (
            <div
              key={s.roll}
              className="card shadow-sm mb-2 border-0"
              style={{ borderRadius: "12px", background: "#f8faff" }}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <strong>{s.roll}</strong>
                  <div className="text-muted small">{s.name}</div>
                </div>

                <div
                  onClick={() => toggleAttendance(s.roll)}
                  className={`fw-semibold px-3 py-1 rounded-pill ${
                    attendance[s.roll] === "P"
                      ? "bg-success-subtle border border-success text-success"
                      : "bg-danger-subtle border border-danger text-danger"
                  }`}
                  style={{ cursor: "pointer", minWidth: "110px", textAlign: "center" }}
                >
                  {attendance[s.roll] === "P" ? "Present" : "Absent"}
                </div>
              </div>
            </div>
          ))}

          {!isSubmitted ? (
            <button
              className="btn btn-success w-100 fw-bold mt-3"
              onClick={handleSubmit}
            >
              Submit Attendance
            </button>
          ) : (
            <div className="alert alert-success text-center fw-bold mt-3">
              Attendance Submitted!
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-4">
        <button
          className="btn btn-outline-primary fw-semibold"
          onClick={() => setShowTodaySummary(!showTodaySummary)}
        >
          📅 View Today's Summary
        </button>
      </div>

      {showTodaySummary && (
        <div className="card shadow-sm p-3 mt-3 border-0" style={{ borderRadius: "12px" }}>
          <h5 className="fw-bold text-center mb-2">Today's Attendance Summary</h5>

          {lockedPeriods.length === 0 ? (
            <p className="text-center text-muted">No periods completed today.</p>
          ) : (
            lockedPeriods.map((p) => (
              <div key={p} className="border-bottom py-2">
                <strong>Period {p}</strong> — Submitted
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
