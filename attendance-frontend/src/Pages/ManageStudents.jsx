import React from "react";
import Papa from "papaparse";

export default function ManageStudents({
  
  setStuFile,
  uploadedStudents,
  filteredStudents,
  studentsDemo,
  filterDept,
  setFilterDept,
  filterYear,
  setFilterYear,
  handleStudentUpload,
  applyStudentFilter,
  resetStudentFilter,
}) {
  const departments = ["", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
  const years = ["", "1st", "2nd", "3rd", "4th"];

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Manage Students</h3>
        <div className="text-muted small">Upload CSV and filter by department/year</div>
      </div>

      {/* Upload & Filter Controls */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d || "Department"}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y || "Year"}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <input
                type="file"
                accept=".csv"
                className="form-control"
                onChange={(e) => setStuFile(e.target.files[0])}
              />
            </div>

            <div className="col-6 col-md-2 d-grid">
              <button className="btn btn-primary" onClick={handleStudentUpload}>
                Upload
              </button>
            </div>

            <div className="col-6 col-md-2 d-grid">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={applyStudentFilter}
                >
                  Filter
                </button>
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={resetStudentFilter}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {(filteredStudents.length
                  ? filteredStudents
                  : uploadedStudents.length
                  ? uploadedStudents
                  : studentsDemo
                ).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No students found
                    </td>
                  </tr>
                ) : (
                  (filteredStudents.length
                    ? filteredStudents
                    : uploadedStudents.length
                    ? uploadedStudents
                    : studentsDemo
                  ).map((s, i) => (
                    <tr key={i}>
                      <td>{s.regNo}</td>
                      <td>{s.name}</td>
                      <td>{s.dept}</td>
                      <td>{s.year}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
