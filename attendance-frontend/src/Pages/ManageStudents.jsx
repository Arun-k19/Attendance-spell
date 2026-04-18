import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

const API = "https://attendance-spell-management.onrender.com/api/students";

const DEPT_CONFIG = {
  CSE:   { emoji: "💻", color: "#2563eb", bg: "#eff6ff" },
  IT:    { emoji: "🖥️", color: "#7c3aed", bg: "#f5f3ff" },
  ECE:   { emoji: "📡", color: "#0891b2", bg: "#ecfeff" },
  MECH:  { emoji: "⚙️", color: "#b45309", bg: "#fffbeb" },
  CIVIL: { emoji: "🏗️", color: "#15803d", bg: "#f0fdf4" },
  EEE:   { emoji: "⚡", color: "#dc2626", bg: "#fff1f2" },
};

const YEAR_LABELS = {
  all: "All", "1": "I Year", "2": "II Year", "3": "III Year", "4": "IV Year",
};

const ALL_DEPARTMENTS = ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"];
const YEAR_OPTIONS    = ["1", "2", "3", "4"];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const emptyStudent = () => ({ regNo: "", name: "", dept: "", year: "" });

export default function ManageStudents() {

  // ── Role detect from localStorage ───────────────────────
  const userData = JSON.parse(localStorage.getItem("user")    || "{}");
  const hodData  = JSON.parse(localStorage.getItem("hodData") || "{}");
  const userRole = userData?.role?.toLowerCase();   // "admin" | "hod"
  const isHOD    = userRole === "hod";
  const hodDept  = isHOD ? (hodData?.department || "") : ""; // "CSE" | "MECH" | etc

  // HOD → only his dept card | Admin → all 6
  const DEPARTMENTS = isHOD ? [hodDept] : ALL_DEPARTMENTS;

  const [students,        setStudents]        = useState([]);
  const [selectedDept,    setSelectedDept]    = useState(null);
  const [selectedYear,    setSelectedYear]    = useState("all");
  const [searchText,      setSearchText]      = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal,   setShowViewModal]   = useState(false);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editData,        setEditData]        = useState(emptyStudent());
  const [newStudent,      setNewStudent]      = useState(emptyStudent());
  const [stuFile,         setStuFile]         = useState(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API);
      // HOD → only his dept students | Admin → all students
      const data = isHOD
        ? res.data.filter((s) => s.dept === hodDept)
        : res.data;
      setStudents(data);
    } catch { console.error("Fetch error"); }
  };

  // ── Filter ──────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const matchDept = selectedDept ? s.dept === selectedDept : false;
    const matchYear = selectedYear === "all" ? true : s.year === selectedYear;

    if (searchText) {
      const q = searchText.toLowerCase();
      const matchSearch =
        s.name?.toLowerCase().includes(q) ||
        s.regNo?.toLowerCase().includes(q) ||
        s.dept?.toLowerCase().includes(q) ||
        YEAR_LABELS[s.year]?.toLowerCase().includes(q);
      return selectedDept
        ? matchDept && matchYear && matchSearch
        : matchSearch;
    }

    return matchDept && matchYear;
  });

  const countForYear = (y) =>
    students.filter((s) =>
      s.dept === selectedDept && (y === "all" ? true : s.year === y)
    ).length;

  // ── CSV ─────────────────────────────────────────────────
  const handleFileChange = (e) => {
    setStuFile(e.target.files[0]);
    Papa.parse(e.target.files[0], { header: true, skipEmptyLines: true });
  };
  const handleUpload = async () => {
    if (!stuFile) return alert("Select a CSV file!");
    const fd = new FormData();
    fd.append("file", stuFile);
    await axios.post(`${API}/upload`, fd);
    alert("Uploaded!");
    fetchStudents();
  };

  // ── CRUD ────────────────────────────────────────────────
  const handleAdd = async () => {
    const { regNo, name, dept, year } = newStudent;
    if (!regNo || !name || !dept || !year) return alert("Fill all fields!");
    try {
      await axios.post(`${API}/add`, newStudent);
      alert("Student added!");
      setNewStudent(emptyStudent());
      setShowAddModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding student");
    }
  };

  const handleUpdate = async () => {
    if (!editData.name || !editData.dept || !editData.year) return alert("Fill all fields!");
    try {
      await axios.put(`${API}/${editData.regNo}`, editData);
      alert("Updated!");
      setShowEditModal(false);
      setShowViewModal(false);
      fetchStudents();
    } catch { alert("Error updating student"); }
  };

  const handleDelete = async (regNo) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await axios.delete(`${API}/${regNo}`);
      setShowViewModal(false);
      setShowEditModal(false);
      fetchStudents();
    } catch { alert("Error deleting student"); }
  };

  const cfg = selectedDept ? DEPT_CONFIG[selectedDept] : null;

  // ── Render ──────────────────────────────────────────────
  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-primary mb-0">Manage Students</h3>
          <small className="text-muted">
            {isHOD
              ? `${hodDept} Department — ${students.length} students`
              : `${students.length} students total`}
          </small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ width: "230px" }}>
            <input type="file" accept=".csv" className="form-control form-control-sm" onChange={handleFileChange} />
            <button className="btn btn-outline-primary btn-sm" onClick={handleUpload}>📤</button>
          </div>
          <button
            className="btn text-white fw-bold px-4"
            style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "10px" }}
            onClick={() => {
              // HOD → dept auto-set | Admin → free select
              setNewStudent({ ...emptyStudent(), dept: isHOD ? hodDept : "" });
              setShowAddModal(true);
            }}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-4" style={{ borderRadius: "12px" }}>
        <input
          className="form-control shadow-sm"
          placeholder="🔍  Search by name, reg no, department, year..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setSelectedDept(null); setSelectedYear("all"); }}
        />
      </div>

      {/* DEPARTMENT CARDS — HOD: only 1 card | Admin: all 6 */}
      {!searchText && (
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Departments</h5>
          <div className="row g-3">
            {DEPARTMENTS.map((d) => {
              const dcfg   = DEPT_CONFIG[d];
              const count  = students.filter((s) => s.dept === d).length;
              const active = selectedDept === d;
              return (
                <div key={d} className="col-md-2 col-sm-4 col-6">
                  <div
                    className="card border-0 shadow-sm text-center p-3"
                    style={{
                      borderRadius: "16px", cursor: "pointer", transition: "all 0.25s",
                      borderTop: `4px solid ${dcfg.color}`,
                      background: active ? dcfg.bg : "white",
                      transform: active ? "translateY(-4px)" : "none",
                      boxShadow: active ? `0 8px 20px ${dcfg.color}33` : "",
                    }}
                    onClick={() => {
                      setSelectedDept(active ? null : d);
                      setSelectedYear("all");
                    }}
                  >
                    <div style={{ fontSize: "26px" }}>{dcfg.emoji}</div>
                    <div className="fw-bold mt-1" style={{ color: dcfg.color, fontSize: "14px" }}>{d}</div>
                    <small className="text-muted">{count} students</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDENTS TABLE with YEAR TABS */}
      {(selectedDept || searchText) && (
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>

          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{
              background: cfg
                ? `linear-gradient(90deg,${cfg.color},#1e3a8a)`
                : "linear-gradient(90deg,#2563eb,#1e3a8a)",
              color: "white",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              {cfg && <span style={{ fontSize: "20px" }}>{cfg.emoji}</span>}
              <span className="fw-bold">
                {searchText ? `Search: "${searchText}"` : `${selectedDept} Department`}
              </span>
              <span className="badge bg-white text-primary ms-1">{filteredStudents.length}</span>
            </div>
            {selectedDept && !searchText && (
              <button className="btn btn-sm btn-outline-light" style={{ borderRadius: "20px" }}
                onClick={() => { setSelectedDept(null); setSelectedYear("all"); }}>
                ⬅ Back
              </button>
            )}
          </div>

          {/* YEAR FILTER TABS */}
          {selectedDept && !searchText && (
            <div className="px-4 pt-3 pb-0 d-flex gap-2 flex-wrap"
              style={{ borderBottom: "1px solid #e2e8f0" }}>
              {["all", ...YEAR_OPTIONS].map((y) => {
                const isActive = selectedYear === y;
                const count    = countForYear(y);
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    style={{
                      border: "none", background: "none", cursor: "pointer",
                      padding: "8px 16px", marginBottom: "-1px",
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? (cfg?.color || "#2563eb") : "#64748b",
                      borderBottom: isActive ? `3px solid ${cfg?.color || "#2563eb"}` : "3px solid transparent",
                      transition: "all 0.2s", fontSize: "14px",
                    }}
                  >
                    {YEAR_LABELS[y]}
                    <span
                      className="ms-2 badge"
                      style={{
                        background: isActive ? (cfg?.bg || "#eff6ff") : "#f1f5f9",
                        color: isActive ? (cfg?.color || "#2563eb") : "#64748b",
                        borderRadius: "20px", fontSize: "11px",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredStudents.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 40 }}>🎓</div>
              <p className="mt-2">No students found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th className="ps-4">Reg No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.regNo}
                      style={{ cursor: "pointer", transition: "0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                      onClick={() => { setSelectedStudent(s); setShowViewModal(true); }}
                    >
                      <td className="ps-4">
                        <span className="badge bg-light text-dark"
                          style={{ fontFamily: "monospace", fontSize: "13px" }}>
                          {s.regNo}
                        </span>
                      </td>
                      <td className="fw-semibold">{s.name}</td>
                      <td>
                        <span className="badge" style={{
                          background: DEPT_CONFIG[s.dept]?.bg || "#f1f5f9",
                          color: DEPT_CONFIG[s.dept]?.color || "#64748b",
                          border: `1px solid ${DEPT_CONFIG[s.dept]?.color || "#94a3b8"}`,
                          borderRadius: "20px", padding: "4px 10px",
                        }}>
                          {DEPT_CONFIG[s.dept]?.emoji} {s.dept}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary"
                          style={{ borderRadius: "20px", padding: "4px 10px" }}>
                          {YEAR_LABELS[s.year] || `Year ${s.year}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedDept && !searchText && (
        <div className="text-center py-4 text-muted">
          <div style={{ fontSize: 48 }}>☝️</div>
          <p className="mt-2">Select a department or search to view students</p>
        </div>
      )}

      {/* ── VIEW MODAL ─────────────────────────────────────── */}
      {showViewModal && selectedStudent && (() => {
        const vcfg = DEPT_CONFIG[selectedStudent.dept] || { color: "#2563eb", bg: "#eff6ff", emoji: "🏫" };
        return (
          <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}
               onClick={() => setShowViewModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <div style={{ height: 8, background: vcfg.color }} />
                <div className="modal-body p-4">
                  <div className="text-center mb-4">
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: vcfg.color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "26px",
                      margin: "0 auto 12px",
                      boxShadow: `0 4px 16px ${vcfg.color}55`,
                    }}>
                      {getInitials(selectedStudent.name)}
                    </div>
                    <h4 className="fw-bold mb-1">{selectedStudent.name}</h4>
                    <span className="badge" style={{
                      background: vcfg.bg, color: vcfg.color,
                      border: `1px solid ${vcfg.color}`,
                      borderRadius: "20px", padding: "5px 14px", fontSize: "13px",
                    }}>
                      {vcfg.emoji} {selectedStudent.dept}
                    </span>
                  </div>
                  <div className="rounded-3 p-3" style={{ background: "#f8fafc" }}>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Reg No</span>
                      <span className="fw-bold" style={{ fontFamily: "monospace" }}>{selectedStudent.regNo}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Department</span>
                      <span className="fw-bold">{selectedStudent.dept}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Year</span>
                      <span className="badge bg-primary" style={{ borderRadius: "20px", padding: "5px 12px" }}>
                        {YEAR_LABELS[selectedStudent.year] || `Year ${selectedStudent.year}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                  <button className="btn btn-danger" onClick={() => handleDelete(selectedStudent.regNo)}>🗑 Delete</button>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                    <button className="btn text-white fw-bold px-3"
                      style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                      onClick={() => { setEditData({ ...selectedStudent }); setShowViewModal(false); setShowEditModal(true); }}>
                      ✏ Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EDIT MODAL ─────────────────────────────────────── */}
      {showEditModal && (
        <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">✏️ Edit Student</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold">Reg No</label>
                <input className="form-control mb-3 shadow-sm bg-light" value={editData.regNo} disabled />
                <label className="form-label fw-semibold">Name</label>
                <input className="form-control mb-3 shadow-sm" placeholder="Student Name"
                  value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                <label className="form-label fw-semibold">Department</label>
                {/* HOD → dept locked | Admin → free dropdown */}
                {isHOD ? (
                  <input
                    className="form-control mb-3 shadow-sm fw-bold"
                    value={hodDept} disabled
                    style={{ background: "#f1f5f9", color: "#2563eb" }}
                  />
                ) : (
                  <select className="form-select mb-3 shadow-sm" value={editData.dept}
                    onChange={(e) => setEditData({ ...editData, dept: e.target.value })}>
                    <option value="">Select Department</option>
                    {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPT_CONFIG[d].emoji} {d}</option>)}
                  </select>
                )}
                <label className="form-label fw-semibold">Year</label>
                <select className="form-select shadow-sm" value={editData.year}
                  onChange={(e) => setEditData({ ...editData, year: e.target.value })}>
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                </select>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button className="btn btn-outline-danger" onClick={() => handleDelete(editData.regNo)}>Delete</button>
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button className="btn text-white fw-bold px-4"
                    style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                    onClick={handleUpdate}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ──────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">➕ Add Student</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold">Reg No</label>
                <input className="form-control mb-3 shadow-sm" placeholder="e.g. 22CS01"
                  value={newStudent.regNo} onChange={(e) => setNewStudent({ ...newStudent, regNo: e.target.value })} />
                <label className="form-label fw-semibold">Name</label>
                <input className="form-control mb-3 shadow-sm" placeholder="Student Name"
                  value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                <label className="form-label fw-semibold">Department</label>
                {/* HOD → dept locked | Admin → free dropdown */}
                {isHOD ? (
                  <input
                    className="form-control mb-3 shadow-sm fw-bold"
                    value={hodDept} disabled
                    style={{ background: "#f1f5f9", color: "#2563eb" }}
                  />
                ) : (
                  <select className="form-select mb-3 shadow-sm" value={newStudent.dept}
                    onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}>
                    <option value="">Select Department</option>
                    {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPT_CONFIG[d].emoji} {d}</option>)}
                  </select>
                )}
                <label className="form-label fw-semibold">Year</label>
                <select className="form-select shadow-sm" value={newStudent.year}
                  onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}>
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                </select>
              </div>
              <div className="modal-footer border-0 justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn text-white fw-bold px-4"
                  style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                  onClick={handleAdd}>Add Student</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}