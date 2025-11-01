import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

export default function ManageStudents() {
  const [stuFile, setStuFile] = useState(null);
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const departments = ["", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
  const years = ["", "1st", "2nd", "3rd", "4th"];

  // ✅ Fetch Students from Backend
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/students");
      setUploadedStudents(res.data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Upload CSV to Backend
  const handleStudentUpload = async () => {
    if (!stuFile) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", stuFile);

    try {
      await axios.post("http://localhost:3001/api/students/upload", formData);
      alert("✅ Students Uploaded Successfully!");
      fetchStudents();
    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Error uploading file!");
    }
  };

  // ✅ Apply Filter
  const applyStudentFilter = () => {
    let data = uploadedStudents;
    if (filterDept) data = data.filter((s) => s.dept === filterDept);
    if (filterYear) data = data.filter((s) => s.year === filterYear);
    setFilteredStudents(data);
  };

  // ✅ Reset Filter
  const resetStudentFilter = () => {
    setFilterDept("");
    setFilterYear("");
    setFilteredStudents([]);
  };

  // ✅ Delete a Student
  const handleDeleteStudent = async (regNo) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/students/${regNo}`);
      alert("🗑️ Student Deleted Successfully!");
      fetchStudents();
    } catch (err) {
      console.error("❌ Delete Error:", err);
    }
  };

  const displayList =
    filteredStudents.length > 0 ? filteredStudents : uploadedStudents;

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Manage Students</h3>
        <div className="text-muted small">
          Upload CSV and filter by department/year
        </div>
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

            <div className="col-6 col-md-2 d-flex gap-2">
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

      {/* Student Table */}
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No students found
                    </td>
                  </tr>
                ) : (
                  displayList.map((s, i) => (
                    <tr key={i}>
                      <td>{s.regNo}</td>
                      <td>{s.name}</td>
                      <td>{s.dept}</td>
                      <td>{s.year}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteStudent(s.regNo)}
                        >
                          Delete
                        </button>
                      </td>
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
