import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

const DEPT_CONFIG = {
  CSE:   { emoji: "💻", color: "#2563eb", bg: "#eff6ff" },
  IT:    { emoji: "🖥️", color: "#7c3aed", bg: "#f5f3ff" },
  ECE:   { emoji: "📡", color: "#0891b2", bg: "#ecfeff" },
  MECH:  { emoji: "⚙️", color: "#b45309", bg: "#fffbeb" },
  CIVIL: { emoji: "🏗️", color: "#15803d", bg: "#f0fdf4" },
  EEE:   { emoji: "⚡", color: "#dc2626", bg: "#fff1f2" },
};

const YEAR_LABELS     = { "1": "I Year", "2": "II Year", "3": "III Year", "4": "IV Year" };
const ALL_DEPARTMENTS = ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"];
const ROLE_OPTIONS    = ["Faculty", "Lab Incharge"];
const YEAR_OPTIONS    = ["1", "2", "3", "4"];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const emptySubject = (defaultDept = "") => ({ name: "", year: "", department: defaultDept });

const emptyForm = (defaultDept = "") => ({
  name: "",
  department: defaultDept,
  subjects: [emptySubject(defaultDept)],
  role: "",
  status: true,
});

export default function ManageStaffs() {

  const userData = JSON.parse(localStorage.getItem("user")    || "{}");
  const hodData  = JSON.parse(localStorage.getItem("hodData") || "{}");
  const userRole = userData?.role?.toLowerCase();
  const isHOD    = userRole === "hod";
  const hodDept  = isHOD ? (hodData?.department || "") : "";
  const DEPARTMENTS = isHOD ? [hodDept] : ALL_DEPARTMENTS;

  const [staffList,     setStaffList]     = useState([]);
  const [selectedDept,  setSelectedDept]  = useState(null);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff,  setEditingStaff]  = useState(null);
  const [formData,      setFormData]      = useState(emptyForm());

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res  = await axios.get(`${BASE_URL}/staff`); // ✅ FIXED
      const data = isHOD ? res.data.filter((s) => s.department === hodDept) : res.data;
      setStaffList(data);
    } catch {
      alert("Failed to load staff data!");
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchDept = selectedDept ? s.department === selectedDept : false;
    if (!searchTerm) return matchDept;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      (s.subjects || []).some(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.year.toLowerCase().includes(q) ||
          (sub.department || "").toLowerCase().includes(q)
      );
    return selectedDept ? matchDept && matchSearch : matchSearch;
  });

  const handleSave = async () => {
    if (!formData.name || !formData.department || !formData.role) {
      alert("Please fill all required fields!");
      return;
    }
    const invalidSub = formData.subjects.find(
      (s) => s.name && (!s.department || !s.year)
    );
    if (invalidSub) {
      alert("Each subject must have a Department and Year selected!");
      return;
    }

    const cleanedSubjects = formData.subjects
      .filter((s) => s.name.trim() !== "")
      .map((s) => ({
        name:       s.name.trim(),
        year:       s.year,
        department: s.department || formData.department,
      }));

    const payload = { ...formData, subjects: cleanedSubjects };

    try {
      if (editingStaff) {
        await axios.put(`${BASE_URL}/staff/${editingStaff._id}`, payload);
        alert("Staff updated!");
      } else {
        await axios.post(`${BASE_URL}/staff/add`, payload);
        alert("Staff added!");
      }
      setShowEditModal(false);
      setEditingStaff(null);
      setFormData(emptyForm(isHOD ? hodDept : ""));
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving staff");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff?")) return;
    try {
      await axios.delete(`${BASE_URL}/staff/${id}`);
      setShowViewModal(false);
      setShowEditModal(false);
      fetchStaff();
    } catch {
      alert("Error deleting staff!");
    }
  };

  const openAdd = () => {
    setEditingStaff(null);
    setFormData(emptyForm(isHOD ? hodDept : ""));
    setShowEditModal(true);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);
    const migratedSubjects = (staff.subjects || []).map((s) => ({
      name:       s.name       || "",
      year:       s.year       || "",
      department: s.department || staff.department || "",
    }));
    setFormData({ ...staff, subjects: migratedSubjects });
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const updateSubject = (idx, field, value) => {
    const subs = [...formData.subjects];
    subs[idx] = { ...subs[idx], [field]: value };
    setFormData({ ...formData, subjects: subs });
  };

  const addSubject = () =>
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        emptySubject(isHOD ? hodDept : formData.department || ""),
      ],
    });

  const removeSubject = (idx) =>
    setFormData({ ...formData, subjects: formData.subjects.filter((_, i) => i !== idx) });

  const getStaffDepts = (staff) => {
    const depts = [...new Set(
      (staff.subjects || [])
        .filter((s) => s.name)
        .map((s) => s.department || staff.department)
        .filter(Boolean)
    )];
    return depts.length > 0 ? depts : [staff.department].filter(Boolean);
  };

  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold text-primary mb-0">Manage Staff</h3>
          <small className="text-muted">
            {isHOD ? `${hodDept} Department — ${staffList.length} staff` : `${staffList.length} staff total`}
          </small>
        </div>
        <button
          className="btn text-white fw-bold px-4"
          style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "10px" }}
          onClick={openAdd}
        >
          + Add Staff
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-4" style={{ borderRadius: "12px" }}>
        <input
          className="form-control shadow-sm"
          placeholder="🔍  Search by name, subject, dept, role, year..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setSelectedDept(null); }}
        />
      </div>

      {/* DEPARTMENT CARDS */}
      {!searchTerm && (
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Departments</h5>
          <div className="row g-3">
            {DEPARTMENTS.map((d) => {
              const cfg    = DEPT_CONFIG[d];
              const count  = staffList.filter((s) => s.department === d).length;
              const active = selectedDept === d;
              return (
                <div key={d} className="col-md-2 col-sm-4 col-6">
                  <div
                    className="card border-0 shadow-sm text-center p-3"
                    style={{
                      borderRadius: "16px", cursor: "pointer", transition: "all 0.25s",
                      borderTop: `4px solid ${cfg.color}`,
                      background: active ? cfg.bg : "white",
                      transform: active ? "translateY(-4px)" : "none",
                      boxShadow: active ? `0 8px 20px ${cfg.color}33` : "",
                    }}
                    onClick={() => setSelectedDept(active ? null : d)}
                  >
                    <div style={{ fontSize: "26px" }}>{cfg.emoji}</div>
                    <div className="fw-bold mt-1" style={{ color: cfg.color, fontSize: "14px" }}>{d}</div>
                    <small className="text-muted">{count} staff</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAFF TABLE */}
      {(selectedDept || searchTerm) && (
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{
              background: selectedDept
                ? `linear-gradient(90deg, ${DEPT_CONFIG[selectedDept]?.color || "#2563eb"}, #1e3a8a)`
                : "linear-gradient(90deg,#2563eb,#1e3a8a)",
              color: "white",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              {selectedDept && <span style={{ fontSize: "20px" }}>{DEPT_CONFIG[selectedDept]?.emoji}</span>}
              <span className="fw-bold">
                {searchTerm ? `Search results for "${searchTerm}"` : `${selectedDept} Department`}
              </span>
              <span className="badge bg-white text-primary ms-1">{filteredStaff.length}</span>
            </div>
            {selectedDept && (
              <button className="btn btn-sm btn-outline-light" style={{ borderRadius: "20px" }} onClick={() => setSelectedDept(null)}>
                ⬅ Back
              </button>
            )}
          </div>

          {filteredStaff.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 40 }}>👤</div>
              <p className="mt-2">No staff found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th className="ps-4">Status</th>
                    <th>Name</th>
                    <th>Departments</th>
                    <th>Subjects</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => {
                    const staffDepts = getStaffDepts(staff);
                    return (
                      <tr
                        key={staff._id}
                        style={{ cursor: "pointer", transition: "0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                        onClick={() => { setSelectedStaff(staff); setShowViewModal(true); }}
                      >
                        <td className="ps-4">
                          <span style={{
                            width: 10, height: 10, borderRadius: "50%", display: "inline-block",
                            backgroundColor: staff.status ? "#22c55e" : "#ef4444",
                            boxShadow: staff.status ? "0 0 5px #22c55e88" : "0 0 5px #ef444488",
                          }} />
                        </td>
                        <td className="fw-semibold">{staff.name}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {staffDepts.map((d) => (
                              <span key={d} className="badge" style={{
                                background: DEPT_CONFIG[d]?.bg || "#f1f5f9",
                                color: DEPT_CONFIG[d]?.color || "#64748b",
                                border: `1px solid ${DEPT_CONFIG[d]?.color || "#94a3b8"}`,
                                borderRadius: "20px", padding: "3px 8px", fontSize: "11px",
                              }}>
                                {DEPT_CONFIG[d]?.emoji} {d}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-muted" style={{ fontSize: "13px" }}>
                          {staff.subjects?.filter(s => s.name).map((s) =>
                            `${s.name} (${YEAR_LABELS[s.year] || s.year}${
                              s.department && s.department !== staff.department ? " · " + s.department : ""
                            })`
                          ).join(", ") || "-"}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark" style={{ borderRadius: "20px" }}>{staff.role}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedDept && !searchTerm && (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>☝️</div>
          <p className="mt-2">Select a department or search to view staff</p>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedStaff && (() => {
        const cfg = DEPT_CONFIG[selectedStaff.department] || { color: "#2563eb", bg: "#eff6ff", emoji: "🏫" };
        const allDepts = getStaffDepts(selectedStaff);
        return (
          <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}
               onClick={() => setShowViewModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <div style={{ height: 8, background: cfg.color }} />
                <div className="modal-body p-4">
                  <div className="text-center mb-4">
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: cfg.color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "26px", margin: "0 auto 12px",
                      boxShadow: `0 4px 16px ${cfg.color}55`,
                    }}>
                      {getInitials(selectedStaff.name)}
                    </div>
                    <h4 className="fw-bold mb-2">{selectedStaff.name}</h4>
                    <div className="d-flex gap-1 justify-content-center flex-wrap">
                      {allDepts.map((d) => (
                        <span key={d} className="badge" style={{
                          background: DEPT_CONFIG[d]?.bg || "#eff6ff",
                          color: DEPT_CONFIG[d]?.color || "#2563eb",
                          border: `1px solid ${DEPT_CONFIG[d]?.color || "#2563eb"}`,
                          borderRadius: "20px", padding: "5px 14px", fontSize: "13px",
                        }}>
                          {DEPT_CONFIG[d]?.emoji} {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3 p-3 mb-3" style={{ background: "#f8fafc" }}>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Role</span>
                      <span className="fw-bold">{selectedStaff.role}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Status</span>
                      <span className="badge" style={{
                        background: selectedStaff.status ? "#dcfce7" : "#fee2e2",
                        color: selectedStaff.status ? "#15803d" : "#dc2626",
                        borderRadius: "20px", padding: "5px 12px",
                      }}>
                        {selectedStaff.status ? "✅ Active" : "❌ Inactive"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-muted d-block mb-2">Subjects, Year & Department</span>
                      {selectedStaff.subjects?.filter(s => s.name).length === 0 ? (
                        <span className="text-muted">No subjects</span>
                      ) : (
                        selectedStaff.subjects?.filter(s => s.name).map((s, i) => {
                          const sDept = s.department || selectedStaff.department;
                          const sCfg  = DEPT_CONFIG[sDept] || { color: "#2563eb", bg: "#eff6ff", emoji: "🏫" };
                          return (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-2"
                              style={{ background: sCfg.bg, border: `1px solid ${sCfg.color}22` }}>
                              <span className="fw-semibold" style={{ fontSize: "14px" }}>{s.name}</span>
                              <div className="d-flex gap-1 align-items-center">
                                <span className="badge" style={{
                                  background: sCfg.color, color: "#fff",
                                  borderRadius: "20px", fontSize: "11px",
                                }}>
                                  {sCfg.emoji} {sDept}
                                </span>
                                <span className="badge bg-primary" style={{ borderRadius: "20px", fontSize: "11px" }}>
                                  {YEAR_LABELS[s.year] || `Year ${s.year}`}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                  <button className="btn btn-danger" onClick={() => handleDelete(selectedStaff._id)}>🗑 Delete</button>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                    <button
                      className="btn text-white fw-bold px-3"
                      style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                      onClick={() => openEdit(selectedStaff)}
                    >
                      ✏ Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT / ADD MODAL */}
      {showEditModal && (
        <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg p-3" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">{editingStaff ? "✏️ Edit Staff" : "➕ Add Staff"}</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Staff Name</label>
                <input className="form-control mb-3 shadow-sm" placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <label className="form-label fw-semibold">
                  Primary Department
                  <span className="text-muted fw-normal ms-1" style={{ fontSize: "12px" }}>(used as default for subjects)</span>
                </label>
                {isHOD ? (
                  <input className="form-control mb-3 shadow-sm fw-bold" value={hodDept} disabled
                    style={{ background: "#f1f5f9", color: "#2563eb" }} />
                ) : (
                  <select className="form-select mb-3 shadow-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {ALL_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{DEPT_CONFIG[d].emoji} {d}</option>
                    ))}
                  </select>
                )}

                <label className="form-label fw-semibold">Role</label>
                <select className="form-select mb-3 shadow-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select Role</option>
                  {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>

                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  Subjects
                  <span className="badge" style={{ background: "#eff6ff", color: "#2563eb", fontSize: "11px", borderRadius: "20px" }}>
                    Each subject can have its own department
                  </span>
                </label>

                <div className="d-flex gap-2 mb-1 px-1">
                  <div style={{ flex: "1 1 0", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Subject Name</div>
                  <div style={{ width: "120px", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Department</div>
                  <div style={{ width: "110px", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Year</div>
                  <div style={{ width: "32px" }} />
                </div>

                {formData.subjects.map((sub, idx) => {
                  const sCfg = DEPT_CONFIG[sub.department];
                  return (
                    <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                      <input
                        className="form-control shadow-sm"
                        placeholder="e.g. Data Structures"
                        value={sub.name}
                        onChange={(e) => updateSubject(idx, "name", e.target.value)}
                        style={{ flex: "1 1 0" }}
                      />

                      {isHOD ? (
                        <div className="d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: "120px", height: "38px", borderRadius: "8px",
                            background: DEPT_CONFIG[hodDept]?.bg || "#f1f5f9",
                            color: DEPT_CONFIG[hodDept]?.color || "#2563eb",
                            border: `1px solid ${DEPT_CONFIG[hodDept]?.color || "#2563eb"}44`,
                            fontSize: "13px", flexShrink: 0,
                          }}>
                          {DEPT_CONFIG[hodDept]?.emoji} {hodDept}
                        </div>
                      ) : (
                        <select
                          className="form-select shadow-sm"
                          style={{
                            width: "120px", flexShrink: 0,
                            borderColor: sCfg ? sCfg.color + "66" : "#cbd5e1",
                            background: sCfg ? sCfg.bg : "#f8fafc",
                            color: sCfg ? sCfg.color : "#334155",
                            fontWeight: sCfg ? 600 : 400,
                          }}
                          value={sub.department}
                          onChange={(e) => updateSubject(idx, "department", e.target.value)}
                        >
                          <option value="">Dept</option>
                          {ALL_DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{DEPT_CONFIG[d].emoji} {d}</option>
                          ))}
                        </select>
                      )}

                      <select
                        className="form-select shadow-sm"
                        style={{ width: "110px", flexShrink: 0 }}
                        value={sub.year}
                        onChange={(e) => updateSubject(idx, "year", e.target.value)}
                      >
                        <option value="">Year</option>
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>{YEAR_LABELS[y]}</option>
                        ))}
                      </select>

                      {formData.subjects.length > 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, borderRadius: "8px", flexShrink: 0, padding: 0 }}
                          onClick={() => removeSubject(idx)}
                        >✕</button>
                      )}
                    </div>
                  );
                })}

                {formData.subjects.some(s => s.name && s.department) && (
                  <div className="d-flex gap-1 flex-wrap mt-1 mb-2">
                    {formData.subjects.filter(s => s.name && s.department).map((s, i) => {
                      const c = DEPT_CONFIG[s.department];
                      return (
                        <span key={i} className="badge" style={{
                          background: c?.bg || "#f1f5f9",
                          color: c?.color || "#334155",
                          border: `1px solid ${c?.color || "#94a3b8"}44`,
                          borderRadius: "20px", padding: "4px 10px", fontSize: "11px",
                        }}>
                          {c?.emoji} {s.department} · {YEAR_LABELS[s.year] || s.year} · {s.name}
                        </span>
                      );
                    })}
                  </div>
                )}

                <button className="btn btn-outline-primary btn-sm mb-3" onClick={addSubject}>
                  + Add Subject
                </button>

                <div className="form-check form-switch mt-2">
                  <input type="checkbox" className="form-check-input"
                    style={{ width: "40px", height: "20px" }}
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  />
                  <label className="form-check-label ms-2 fw-semibold">
                    {formData.status ? "✅ Active" : "❌ Inactive"}
                  </label>
                </div>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">
                {editingStaff && (
                  <button className="btn btn-outline-danger" onClick={() => handleDelete(editingStaff._id)}>Delete</button>
                )}
                <div className="ms-auto d-flex gap-2">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button
                    className="btn text-white fw-bold px-4"
                    style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}