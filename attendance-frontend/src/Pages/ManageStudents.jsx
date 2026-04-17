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

  const [selectedDept, setSelectedDept] = useState(null); // 🔥 NEW

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
      const res = await axios.get("https://attendance-spell-management.onrender.com/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ===================== CSV =====================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setStuFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(results.data);
      },
    });
  };

  const handleStudentUpload = async () => {
    if (!stuFile) return alert("Select CSV!");

    const formData = new FormData();
    formData.append("file", stuFile);

    await axios.post("https://attendance-spell-management.onrender.com/api/students/upload", formData);
    alert("Uploaded!");
    fetchStudents();
  };

  // ===================== FILTER =====================
  useEffect(() => {
    let data = students;

    if (filterDept) data = data.filter((s) => s.dept === filterDept);
    if (filterYear) data = data.filter((s) => s.year === filterYear);

    // 🔥 NEW: dept card filter
    if (selectedDept) {
      data = data.filter((s) => s.dept === selectedDept);
    }

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
  }, [students, filterDept, filterYear, searchText, selectedDept]);

  // ===================== ADD =====================
  const handleAddStudent = async () => {
    const { regNo, name, dept, year } = newStudent;

    if (!regNo || !name || !dept || !year)
      return alert("Fill all fields!");

    await axios.post("https://attendance-spell-management.onrender.com/api/students/add", newStudent);

    setNewStudent({ regNo: "", name: "", dept: "", year: "" });
    fetchStudents();
  };

  // ===================== DELETE =====================
  const handleDeleteStudent = async (regNo) => {
    if (!window.confirm("Delete this student?")) return;

    await axios.delete(`https://attendance-spell-management.onrender.com/api/students/${regNo}`);
    fetchStudents();
    setSelectedStudent(null);
  };

  // ===================== UPDATE =====================
  const handleUpdateStudent = async () => {
    await axios.put(
      `https://attendance-spell-management.onrender.com/api/students/${selectedStudent.regNo}`,
      selectedStudent
    );
    alert("Updated!");
    setEditMode(false);
    fetchStudents();
  };

  // ===================== UI =====================
  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary">Manage Students</h3>
      </div>

      {/* Upload */}
      <div className="d-flex justify-content-end mb-3">
        <div className="input-group" style={{ width: "350px" }}>
          <input type="file" accept=".csv" className="form-control" onChange={handleFileChange}/>
          <button className="btn btn-primary" onClick={handleStudentUpload}>
            Upload
          </button>
        </div>
      </div>

      {/* Add */}
      <div className="card p-3 mb-4">
        <h5>➕ Add Student</h5>

        <div className="row g-2">
          <input className="col form-control" placeholder="Reg No"
            value={newStudent.regNo}
            onChange={(e)=>setNewStudent({...newStudent,regNo:e.target.value})}
          />

          <input className="col form-control" placeholder="Name"
            value={newStudent.name}
            onChange={(e)=>setNewStudent({...newStudent,name:e.target.value})}
          />

          <select className="col form-select"
            value={newStudent.dept}
            onChange={(e)=>setNewStudent({...newStudent,dept:e.target.value})}>
            {departments.map(d=> <option key={d}>{d||"Dept"}</option>)}
          </select>

          <select className="col form-select"
            value={newStudent.year}
            onChange={(e)=>setNewStudent({...newStudent,year:e.target.value})}>
            {years.map(y=> <option key={y}>{y||"Year"}</option>)}
          </select>

          <button className="btn btn-success col" onClick={handleAddStudent}>
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <select className="col form-select" value={filterDept} onChange={(e)=>setFilterDept(e.target.value)}>
            {departments.map(d=> <option key={d}>{d||"Department"}</option>)}
          </select>

          <select className="col form-select" value={filterYear} onChange={(e)=>setFilterYear(e.target.value)}>
            {years.map(y=> <option key={y}>{y||"Year"}</option>)}
          </select>

          <input className="col form-control" placeholder="Search..."
            value={searchText}
            onChange={(e)=>setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* 🔥 Departments Cards */}
      <div className="mb-4">
        <h5 className="fw-bold">Departments</h5>

        <div className="row g-3">
          {["CSE","ECE","MECH","CIVIL","EEE","IT"].map((d,i)=>(
            <div key={i} className="col-md-3">
              <div
                className="card p-3 text-center shadow-sm"
                style={{
                  cursor:"pointer",
                  borderRadius:"12px",
                  background: selectedDept === d ? "#dbeafe" : "white"
                }}
                onClick={()=>setSelectedDept(d)}
              >
                <h6>{d}</h6>
              </div>
            </div>
          ))}
        </div>

        {selectedDept && (
          <button className="btn btn-secondary mt-3"
            onClick={()=>setSelectedDept(null)}>
            ⬅ Back
          </button>
        )}
      </div>

      {/* Table */}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Year</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((s)=>(
            <tr key={s.regNo}>
              <td>{s.regNo}</td>
              <td>{s.name}</td>
              <td>{s.dept}</td>
              <td>{s.year}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </section>
  );
}