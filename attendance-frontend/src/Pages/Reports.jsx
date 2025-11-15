import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

const Reports = () => {
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState([]);
  const [workingDays, setWorkingDays] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showToast, setShowToast] = useState(null);

  // Holidays
  const holidays = [
    { date: "2025-01-26", name: "Republic Day" },
    { date: "2025-08-15", name: "Independence Day" },
    { date: "2025-10-02", name: "Gandhi Jayanti" },
    { date: "2025-12-25", name: "Christmas" },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setToDate(today);
  }, []);

  const showAlert = (message, type = "info") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 2500);
  };

  // 📅 Smart Date Validation
  const handleSmartDate = (type, value) => {
    const dateObj = new Date(value);

    if (dateObj > new Date()) {
      showAlert("⛔ Future date cannot be selected!", "danger");
      return;
    }
    if (dateObj.getDay() === 0) {
      showAlert("🚫 Sunday is not a working day!", "danger");
      return;
    }
    const holiday = holidays.find((h) => h.date === value);
    if (holiday) {
      showAlert(`🎌 ${holiday.name} — Holiday`, "warning");
      return;
    }

    type === "from" ? setFromDate(value) : setToDate(value);
  };

  // 🧮 Working Days Calculation
  useEffect(() => {
    if (fromDate && toDate) {
      const s = new Date(fromDate);
      const e = new Date(toDate);

      if (s > e) {
        setWorkingDays(null);
        showAlert("⚠️ From date cannot be after To date!", "danger");
        return;
      }

      let count = 0;
      const temp = new Date(s);
      while (temp <= e) {
        const d = temp.getDay();
        const dStr = temp.toISOString().split("T")[0];
        const isHoliday = holidays.some((h) => h.date === dStr);

        if (d !== 0 && d !== 6 && !isHoliday) count++;
        temp.setDate(temp.getDate() + 1);
      }
      setWorkingDays(count);
    }
  }, [fromDate, toDate]);

  // 📊 Report Calculation
  const calculateReport = () => {
    const stored = JSON.parse(localStorage.getItem("attendanceData") || "{}");

    if (!Object.keys(stored).length) {
      showAlert("No attendance data found!", "danger");
      return;
    }

    const final = [];
    const s = new Date(fromDate);
    const e = new Date(toDate);

    Object.keys(stored).forEach((key) => {
      const [dept, yr, date] = key.split("_");
      const dObj = new Date(date);

      if (
        (department && dept !== department) ||
        (year && yr !== year) ||
        dObj < s ||
        dObj > e
      )
        return;

      const periods = stored[key];
      Object.keys(periods).forEach((p) => {
        const { attendance } = periods[p];

        Object.entries(attendance).forEach(([roll, status]) => {
          let stu = final.find((r) => r.roll === roll);

          if (!stu)
            final.push({
              roll,
              dept,
              yr,
              total: 0,
              present: 0,
            });

          stu = final.find((r) => r.roll === roll);
          stu.total++;
          if (status === "P") stu.present++;
        });
      });
    });

    final.forEach((s) => {
      s.percentage = s.total
        ? ((s.present / s.total) * 100).toFixed(1)
        : 0;
    });

    setReport(final);
    setShowReport(true);
  };

  // Excel Export
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">📊 Attendance Reports</h3>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className={`position-fixed top-0 end-0 mt-3 me-3 alert alert-${showToast.type}`}
          style={{ zIndex: 9999 }}
        >
          {showToast.message}
        </div>
      )}

      {/* Filters */}
      <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
        <div className="row g-2">

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control shadow-sm"
              value={fromDate}
              onChange={(e) => handleSmartDate("from", e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control shadow-sm"
              value={toDate}
              onChange={(e) => handleSmartDate("to", e.target.value)}
            />
          </div>

          <div className="col-md-2 d-grid">
            <button
              className="btn text-white fw-bold shadow-sm"
              style={{
                background: "linear-gradient(90deg,#22c55e,#16a34a)",
              }}
              onClick={calculateReport}
            >
              📄 View
            </button>
          </div>
        </div>
      </div>

      {/* Working Days */}
      {workingDays !== null && (
        <div className="alert alert-info fw-semibold text-center">
          🗓 Total Working Days: {workingDays}
        </div>
      )}

      {/* Report Table */}
      {showReport && (
        <div className="card shadow-sm border-0 p-3" style={{ borderRadius: "12px" }}>

          <div className="d-flex justify-content-between">
            <h5 className="fw-bold text-primary">Attendance Summary</h5>

            <button
              className="btn btn-outline-primary"
              onClick={exportToExcel}
            >
              📘 Export
            </button>
          </div>

          <table className="table table-hover mt-3">
            <thead style={{ background: "#2563eb", color: "white" }}>
              <tr>
                <th>Roll No</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Present</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>

            <tbody>
              {report.map((r) => (
                <tr
                  key={r.roll}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedStudent(r)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eef3ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td className="fw-bold">{r.roll}</td>
                  <td>{r.dept}</td>
                  <td>{r.yr}</td>
                  <td>{r.present}</td>
                  <td>{r.total}</td>
                  <td
                    className={
                      r.percentage >= 75
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {r.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Student */}
      {selectedStudent && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3 shadow-lg" style={{ borderRadius: "15px" }}>

              <div className="modal-header">
                <h5 className="fw-bold text-primary">{selectedStudent.roll}</h5>
                <button className="btn-close" onClick={() => setSelectedStudent(null)}></button>
              </div>

              <div className="modal-body">
                <p><b>Dept:</b> {selectedStudent.dept}</p>
                <p><b>Year:</b> {selectedStudent.yr}</p>
                <p><b>Total Periods:</b> {selectedStudent.total}</p>
                <p><b>Present:</b> {selectedStudent.present}</p>
                <p><b>Absent:</b> {selectedStudent.total - selectedStudent.present}</p>
                <p>
                  <b>Attendance:</b>{" "}
                  <span
                    className={
                      selectedStudent.percentage >= 75
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {selectedStudent.percentage}%
                  </span>
                </p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reports;
