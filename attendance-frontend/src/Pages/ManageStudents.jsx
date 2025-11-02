import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

export default function ManageStudents() {
  const [stuFile, setStuFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchName, setSearchName] = useState("");
  const [newStudent, setNewStudent] = useState({
    regNo: "",
    name: "",
    dept: "",
    year: "",
  });

  const departments = ["", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
  const years = ["", "1st", "2nd", "3rd", "4th"];

  // ✅ Fetch All Students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/students");
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ CSV File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setStuFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setPreviewData(results.data);
      },
    });
  };

  // ✅ Upload CSV
  const handleStudentUpload = async () => {
    if (!stuFile) return alert("Please select a CSV file first!");

    const formData = new FormData();
    formData.append("file", stuFile);

    try {
      await axios.post("http://localhost:3001/api/students/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Students Uploaded Successfully!");
      setStuFile(null);
      setPreviewData([]);
      fetchStudents();
    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert(`Upload Failed! ${err.response?.data?.msg || ""}`);
    }
  };

  // ✅ Filter by Department, Year, and Name
  useEffect(() => {
    let data = students;
    if (filterDept) data = data.filter((s) => s.dept === filterDept);
    if (filterYear) data = data.filter((s) => s.year === filterYear);
    if (searchName)
      data = data.filter((s) =>
        s.name.toLowerCase().includes(searchName.toLowerCase())
      );
    setFilteredStudents(data);
  }, [filterDept, filterYear, searchName, students]);

  // ✅ Delete Student
  const handleDeleteStudent = async (regNo) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/students/${regNo}`);
      alert("🗑️ Deleted successfully!");
      fetchStudents();
    } catch (err) {
      console.error("❌ Delete Error:", err);
    }
  };

  // ✅ Add Student Manually
  const handleAddStudent = async () => {
    if (
      !newStudent.regNo ||
      !newStudent.name ||
      !newStudent.dept ||
      !newStudent.year
    ) {
      alert("⚠️ Please fill all fields before adding!");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/students/add", newStudent);
      alert("✅ Student Added Successfully!");
      setNewStudent({ regNo: "", name: "", dept: "", year: "" });
      fetchStudents();
    } catch (err) {
      console.error("❌ Add Error:", err);
    }
  };

  return (
    <section className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Manage Students</h3>
        <span className="text-muted small">
          Upload or manage students by Department / Year / Name
        </span>
      </div>

      {/* 🔹 Filters */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body row g-2 align-items-center">
          <div className="col-md-2">
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
          <div className="col-md-2">
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
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="file"
              accept=".csv"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" onClick={handleStudentUpload}>
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Manual Add Student */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body row g-2 align-items-center">
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Reg No"
              value={newStudent.regNo}
              onChange={(e) =>
                setNewStudent({ ...newStudent, regNo: e.target.value })
              }
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newStudent.dept}
              onChange={(e) =>
                setNewStudent({ ...newStudent, dept: e.target.value })
              }
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d || "Dept"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newStudent.year}
              onChange={(e) =>
                setNewStudent({ ...newStudent, year: e.target.value })
              }
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y || "Year"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-success" onClick={handleAddStudent}>
              ➕ Add Student
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Table Display */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr className="table-primary">
                <th>Reg No</th>
                <th>Name</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, i) => (
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
    </section>
  );
}
