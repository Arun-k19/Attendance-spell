import React, { useState } from "react";
import Papa from "papaparse";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // CSV / Excel File Upload
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        // Filter by year & department if selected
        const filtered = results.data.filter((s) => {
          return (
            (!selectedYear || s.Year === selectedYear) &&
            (!selectedDept || s.Department === selectedDept)
          );
        });
        setStudents(filtered);
      },
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h3 className="fw-bold mb-3">Manage Students</h3>

      {/* Filters & File Upload */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select"
          style={{ width: "150px" }}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          <option>1st</option>
          <option>2nd</option>
          <option>3rd</option>
          <option>4th</option>
        </select>

        <select
          className="form-select"
          style={{ width: "150px" }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">Select Department</option>
          <option>CSE</option>
          <option>ECE</option>
          <option>MECH</option>
          <option>CIVIL</option>
        </select>

        <input
          type="file"
          className="form-control"
          style={{ width: "300px" }}
          accept=".csv"
          onChange={handleFile}
        />
      </div>

      {/* Table Preview */}
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
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No Students to display
                </td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.RegNo}</td>
                  <td>{s.Name}</td>
                  <td>{s.Department}</td>
                  <td>{s.Year}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStudents;
