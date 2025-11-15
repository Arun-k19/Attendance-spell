import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

export default function ManageStudents() {
  const [stuFile, setStuFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchText, setSearchText] = useState("");

  const [newStudent, setNewStudent] = useState({
    regNo: "",
    name: "",
    dept: "",
    year: "",
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const departments = ["", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
  const years = ["", "1", "2", "3", "4"];

  // ===================== FETCH =====================
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

  // ===================== CSV Parse =====================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setStuFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = results.data.filter(
          (row) =>
            row.regNo?.trim() &&
            row.name?.trim() &&
            row.dept?.trim() &&
            row.year?.trim()
        );
        console.log(valid);
      },
    });
  };

  const handleStudentUpload = async () => {
    if (!stuFile) return alert("Select CSV!");

    const formData = new FormData();
    formData.append("file", stuFile);

    try {
      await axios.post("http://localhost:3001/api/students/upload", formData);
      alert("Uploaded!");
      fetchStudents();
    } catch (err) {
      alert("Upload failed");
    }
  };

  // ===================== SEARCH & FILTER =====================
  useEffect(() => {
    let data = students;

    if (filterDept) data = data.filter((s) => s.dept === filterDept);
    if (filterYear) data = data.filter((s) => s.year === filterYear);

    if (searchText) {
      const t = searchText.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(t) ||
          s.regNo.toLowerCase().includes(t) ||
          s.dept.toLowerCase().includes(t) ||
          s.year.toLowerCase().includes(t)
      );
    }

    setFilteredStudents(data);
  }, [filterDept, filterYear, searchText, students]);

  // ===================== ADD STUDENT =====================
  const handleAddStudent = async () => {
    const { regNo, name, dept, year } = newStudent;

    if (!regNo || !name || !dept || !year)
      return alert("Fill all fields!");

    try {
      await axios.post("http://localhost:3001/api/students/add", newStudent);
      alert("Added!");
      setNewStudent({ regNo: "", name: "", dept: "", year: "" });
      fetchStudents();
    } catch (err) {
      alert("Add error");
    }
  };

  // ===================== DELETE =====================
  const handleDeleteStudent = async (regNo) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/students/${regNo}`);
      fetchStudents();
      setSelectedStudent(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ===================== UPDATE STUDENT =====================
  const handleUpdateStudent = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/students/${selectedStudent.regNo}`,
        selectedStudent
      );
      alert("Updated!");
      setEditMode(false);
      fetchStudents();
    } catch (err) {
      alert("Update failed");
    }
  };

  // =======================================================================
  //                                    UI STARTS
  // =======================================================================
  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* ===================== PAGE TITLE (ADDED) ===================== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary">Manage Students</h3>
      </div>

      {/* ===================== CSV Upload ===================== */}
      <div className="d-flex justify-content-end mb-3">
        <div className="input-group" style={{ width: "350px" }}>
          <input
            type="file"
            accept=".csv"
            className="form-control shadow-sm"
            onChange={handleFileChange}
          />
          <button
            className="btn"
            style={{
              background: "linear-gradient(90deg, #2563eb, #1e3a8a)",
              color: "white",
              fontWeight: "bold",
            }}
            onClick={handleStudentUpload}
          >
            Upload
          </button>
        </div>
      </div>

      {/* ===================== Add Student ===================== */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body row g-3">
          <h5 className="fw-bold text-primary">➕ Add New Student</h5>

          <div className="col-md-3">
            <input
              className="form-control shadow-sm"
              placeholder="Reg No"
              value={newStudent.regNo}
              onChange={(e) =>
                setNewStudent({ ...newStudent, regNo: e.target.value })
              }
            />
          </div>

          <div className="col-md-4">
            <input
              className="form-control shadow-sm"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={newStudent.dept}
              onChange={(e) =>
                setNewStudent({ ...newStudent, dept: e.target.value })
              }
            >
              {departments.map((d) => (
                <option key={d}>{d || "Dept"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={newStudent.year}
              onChange={(e) =>
                setNewStudent({ ...newStudent, year: e.target.value })
              }
            >
              {years.map((y) => (
                <option key={y}>{y || "Year"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3 d-grid">
            <button
              className="btn shadow-sm"
              style={{
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                color: "white",
                fontWeight: "bold",
              }}
              onClick={handleAddStudent}
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* ===================== Filters ===================== */}
      <div className="card shadow-sm border-0 mb-3" style={{ borderRadius: "12px" }}>
        <div className="card-body row g-3">
          <div className="col-md-3">
            <select
              className="form-select shadow-sm"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d}>{d || "Department"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select shadow-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y}>{y || "Year"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-7">
            <input
              className="form-control shadow-sm"
              placeholder="Search by Name, Reg No, Dept or Year..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===================== Table ===================== */}
      <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="table-responsive p-3">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: "#2563eb", color: "white" }}>
                <th>Reg No</th>
                <th>Name</th>
                <th>Dept</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.regNo}
                  onClick={() => {
                    setSelectedStudent(s);
                    setEditMode(false);
                  }}
                  style={{
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eff6ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td>{s.regNo}</td>
                  <td>{s.name}</td>
                  <td>{s.dept}</td>
                  <td>{s.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== POPUP ===================== */}
      {selectedStudent && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", animation: "fadeIn 0.3s" }}
        >
          <div
            className="card p-4 shadow-lg"
            style={{
              width: "400px",
              borderRadius: "15px",
              animation: "zoomIn 0.25s",
            }}
          >
            <h5 className="fw-bold text-primary mb-3">Student Details</h5>

            <label>Reg No</label>
            <input
              className="form-control mb-2 shadow-sm"
              disabled={!editMode}
              value={selectedStudent.regNo}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  regNo: e.target.value,
                })
              }
            />

            <label>Name</label>
            <input
              className="form-control mb-2 shadow-sm"
              disabled={!editMode}
              value={selectedStudent.name}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  name: e.target.value,
                })
              }
            />

            <label>Department</label>
            <select
              className="form-select mb-2 shadow-sm"
              disabled={!editMode}
              value={selectedStudent.dept}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  dept: e.target.value,
                })
              }
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <label>Year</label>
            <select
              className="form-select mb-3 shadow-sm"
              disabled={!editMode}
              value={selectedStudent.year}
              onChange={(e) =>
                setSelectedStudent({
                  ...selectedStudent,
                  year: e.target.value,
                })
              }
            >
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>

            <div className="d-flex justify-content-between">
              {!editMode ? (
                <button className="btn btn-warning" onClick={() => setEditMode(true)}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleUpdateStudent}>
                  Save
                </button>
              )}

              <button className="btn btn-danger"
                onClick={() => handleDeleteStudent(selectedStudent.regNo)}>
                Delete
              </button>

              <button className="btn btn-secondary"
                onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP ANIMATIONS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity:0; }
            to { opacity:1; }
          }
          
          @keyframes zoomIn {
            from { transform:scale(0.7); opacity:0; }
            to { transform:scale(1); opacity:1; }
          }
        `}
      </style>
    </section>
  );
}
