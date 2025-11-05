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
      alert("⛔ You cannot select a future date!");
      return;
    }
    if (dateObj.getDay() === 0) {
      alert("🚫 Sunday is not a working day!");
      return;
    }
    const holiday = holidays.find((h) => h.date === value);
    if (holiday) {
      alert(`🎌 ${holiday.name} — It's a Government Holiday!`);
      return;
    }
    type === "from" ? setFromDate(value) : setToDate(value);
  };

  // 🧮 Working Days Calculation
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        setWorkingDays(null);
        showAlert("⚠️ 'From Date' cannot be after 'To Date'!", "danger");
        return;
      }

      let count = 0;
      const temp = new Date(start);
      while (temp <= end) {
        const day = temp.getDay();
        const dateStr = temp.toISOString().split("T")[0];
        const isHoliday = holidays.some((h) => h.date === dateStr);
        if (day !== 0 && day !== 6 && !isHoliday) count++;
        temp.setDate(temp.getDate() + 1);
      }
      setWorkingDays(count);
    }
  }, [fromDate, toDate]);

  // 🧾 Report Calculation
  const calculateReport = () => {
    const data = JSON.parse(localStorage.getItem("attendanceData") || "{}");
    if (!Object.keys(data).length) {
      showAlert("No attendance records found!", "danger");
      return;
    }

    const reportList = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);

    Object.keys(data).forEach((key) => {
      const [dept, yr, date] = key.split("_");
      const dateObj = new Date(date);
      if (
        (department && dept !== department) ||
        (year && yr !== year) ||
        dateObj < start ||
        dateObj > end
      )
        return;

      const periods = data[key];
      Object.keys(periods).forEach((periodNum) => {
        const { attendance } = periods[periodNum];
        Object.entries(attendance).forEach(([roll, status]) => {
          let student = reportList.find((r) => r.roll === roll);
          if (!student)
            reportList.push({
              roll,
              dept,
              yr,
              total: 0,
              present: 0,
              dates: {},
            });

          student = reportList.find((r) => r.roll === roll);
          student.total++;
          if (status === "P") student.present++;
          if (!student.dates[date])
            student.dates[date] = { [periodNum]: status };
          else student.dates[date][periodNum] = status;
        });
      });
    });

    const final = reportList.map((s) => ({
      ...s,
      percentage: s.total ? ((s.present / s.total) * 100).toFixed(1) : 0,
    }));

    setReport(final);
    setShowReport(true);
  };

  // 📤 Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  return (
    <section className="container py-3">
      <h4 className="fw-bold text-primary text-center mb-3">
        📊 Attendance Reports (Modern View)
      </h4>

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
      <div className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-2">
            <select
              className="form-select"
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
              className="form-select"
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
            <label className="small text-muted ms-1">From:</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => handleSmartDate("from", e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="small text-muted ms-1">To:</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => handleSmartDate("to", e.target.value)}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-success" onClick={calculateReport}>
              📄 View Report
            </button>
          </div>
        </div>
      </div>

      {/* Working Days Info */}
      {workingDays !== null && (
        <div className="alert alert-info fw-semibold text-center">
          🗓️ Working Days between <strong>{fromDate}</strong> and{" "}
          <strong>{toDate}</strong>: {workingDays} Days
        </div>
      )}

      {/* Report Table */}
      {showReport && (
        <div className="card border-0 shadow-sm p-3">
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-bold text-primary">Attendance Summary</h5>
            <button className="btn btn-outline-primary" onClick={exportToExcel}>
              📘 Export Excel
            </button>
          </div>

          <table className="table table-bordered table-striped text-center">
            <thead className="table-primary">
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
                >
                  <td className="fw-bold text-primary">{r.roll}</td>
                  <td>{r.dept}</td>
                  <td>{r.yr}</td>
                  <td>{r.present}</td>
                  <td>{r.total}</td>
                  <td
                    className={
                      r.percentage >= 75 ? "text-success fw-bold" : "text-danger fw-bold"
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

      {/* Student Info Card */}
      {selectedStudent && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3 border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">
                  🎓 {selectedStudent.roll}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedStudent(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Department:</strong> {selectedStudent.dept}
                </p>
                <p>
                  <strong>Year:</strong> {selectedStudent.yr}
                </p>
                <p>
                  <strong>Total Periods:</strong> {selectedStudent.total}
                </p>
                <p>
                  <strong>Present:</strong> {selectedStudent.present}
                </p>
                <p>
                  <strong>Absent:</strong>{" "}
                  {selectedStudent.total - selectedStudent.present}
                </p>
                <p>
                  <strong>Attendance:</strong>{" "}
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
              <div className="modal-footer border-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedStudent(null)}
                >
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
