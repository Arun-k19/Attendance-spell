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

  // Government holidays
  const holidays = ["2025-01-26", "2025-08-15", "2025-10-02", "2025-12-25"];

  // Auto set today's date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Load locked periods for class/date
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

  // Sample student data
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
      showAlert("🎌 Today is a Government Holiday!", "danger");
      return;
    }

    const selectedDate = new Date(date);
    if (selectedDate.getDay() === 0) {
      showAlert("🚫 Sunday is not a working day!", "danger");
      return;
    }

    if (department && year && date && period && subject) {
      if (lockedPeriods.includes(Number(period))) {
        showAlert(`Period ${period} already submitted!`, "warning");
        return;
      }

      const list = studentData[department]?.[year];
      if (!list) return showAlert("No student data found!", "danger");

      const initial = {};
      list.forEach((s) => (initial[s.roll] = "P"));
      setStudents(list);
      setAttendance(initial);
      setIsLoaded(true);
      showAlert("✅ Students loaded successfully!", "success");
    } else {
      showAlert("Please fill all fields!", "danger");
    }
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

    showAlert(`✅ Attendance for Period ${period} submitted!`, "success");
  };

  const availablePeriods = [1, 2, 3, 4, 5, 6, 7, 8].filter(
    (p) => !lockedPeriods.includes(p)
  );
  const allPeriodsDone = lockedPeriods.length === 8;

  return (
    <div className="container py-3">
      <div
        className="d-flex justify-content-between align-items-center mb-3"
        style={{ borderBottom: "2px solid #e9ecef", paddingBottom: "6px" }}
      >
        <h4 className="fw-bold text-primary mb-0">📝 Smart Attendance System</h4>
        <input
          type="date"
          className="form-control text-center fw-semibold"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            border: "2px solid #0d6efd",
            borderRadius: "8px",
            padding: "4px 8px",
            width: "180px",
          }}
        />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`position-fixed top-0 end-0 mt-3 me-3 alert alert-${showToast.type}`}
          style={{
            zIndex: 9999,
            fontWeight: "600",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          {showToast.message}
        </div>
      )}

      {/* Filters - All in One Line */}
      <div className="row g-2 mb-3 bg-white p-2 rounded shadow-sm align-items-center">
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={isLoaded || isSubmitted}
          >
            <option value="">Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={isLoaded || isSubmitted}
          >
            <option value="">Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={isLoaded || isSubmitted || availablePeriods.length === 0}
          >
            <option value="">Period</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoaded || isSubmitted}
          />
        </div>
      </div>

      {/* Start Button */}
      {!isLoaded && (
        <div className="d-grid mb-3">
          <button
            className="btn btn-primary"
            onClick={loadStudents}
            disabled={!subject}
          >
            🚀 Start Attendance
          </button>
        </div>
      )}

      {/* Student List */}
      {students.length > 0 && (
        <div>
          {students.map((s) => (
            <div
              key={s.roll}
              className="card mb-2 shadow-sm border-0"
              style={{
                borderRadius: "12px",
                background: "#f9fbff",
              }}
            >
              <div className="card-body d-flex justify-content-between align-items-center py-2">
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
                  style={{
                    cursor: "pointer",
                    transition: "0.3s",
                    minWidth: "110px",
                    textAlign: "center",
                  }}
                >
                  {attendance[s.roll] === "P" ? "✅ Present" : "❌ Absent"}
                </div>
              </div>
            </div>
          ))}

          <div className="d-grid gap-2 mt-3">
            {!isSubmitted && (
              <button className="btn btn-success" onClick={handleSubmit}>
                ✅ Submit Attendance (Period {period})
              </button>
            )}
            {isSubmitted && (
              <div className="alert alert-success text-center fw-semibold mb-0">
                ✅ Attendance for Period {period} submitted!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's Summary */}
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowTodaySummary(!showTodaySummary)}
          disabled={!department || !year || !date}
        >
          📅 View Today’s Attendance
        </button>
      </div>

      {showTodaySummary && (
        <div className="mt-3 border rounded p-3 bg-white shadow-sm">
          <h5 className="text-center fw-bold mb-3">
            📋 Today's Attendance Summary
          </h5>
          {lockedPeriods.length === 0 ? (
            <p className="text-center text-muted">No periods submitted yet.</p>
          ) : (
            lockedPeriods.map((p) => (
              <div key={p} className="mb-2 border-bottom pb-2">
                <strong>Period {p}</strong> — ✅ Attendance Submitted
              </div>
            ))
          )}
        </div>
      )}

      {allPeriodsDone && (
        <div className="alert alert-info mt-4 text-center fw-bold">
          🎉 All 8 Periods Attendance Completed for Today!
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
