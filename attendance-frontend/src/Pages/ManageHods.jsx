import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

const DEPT_COLORS = {
  CSE:   { bg: "#eff6ff", border: "#2563eb", badge: "#2563eb" },
  IT:    { bg: "#f5f3ff", border: "#7c3aed", badge: "#7c3aed" },
  ECE:   { bg: "#ecfeff", border: "#0891b2", badge: "#0891b2" },
  MECH:  { bg: "#fffbeb", border: "#b45309", badge: "#b45309" },
  CIVIL: { bg: "#f0fdf4", border: "#15803d", badge: "#15803d" },
  EEE:   { bg: "#fff1f2", border: "#dc2626", badge: "#dc2626" },
};

const DEPT_EMOJI = {
  CSE: "💻", IT: "🖥️", ECE: "📡", MECH: "⚙️", CIVIL: "🏗️", EEE: "⚡",
};

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function ManageHODs() {
  const [hodList, setHodList]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHod, setSelectedHod]   = useState(null);
  const [editingHod, setEditingHod]     = useState(null);
  const [showViewCard, setShowViewCard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", department: "", role: "HOD", status: true,
  });

  useEffect(() => { fetchHods(); }, []);

  const fetchHods = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/hod`);
      setHodList(res.data || []);
    } catch {
      alert("Failed to load HOD data!");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.department.trim()) {
      alert("Please fill all fields!");
      return;
    }
    const payload = { name: formData.name, department: formData.department, role: "HOD", status: formData.status };
    try {
      if (editingHod) {
        await axios.put(`${BASE_URL}/hod/${editingHod._id}`, payload);
        alert("HOD Updated!");
      } else {
        await axios.post(`${BASE_URL}/hod`, payload);
        alert("HOD Added!");
      }
      fetchHods();
      setShowEditModal(false);
      setEditingHod(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving HOD!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this HOD?")) return;
    try {
      await axios.delete(`${BASE_URL}/hod/${id}`);
      alert("HOD Deleted!");
      fetchHods();
      setShowViewCard(false);
      setShowEditModal(false);
    } catch {
      alert("Error deleting HOD!");
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", department: "", role: "HOD", status: true });
    setEditingHod(null);
    setShowEditModal(true);
  };

  const filteredHods = hodList.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold text-primary mb-0">Manage HODs</h3>
          <small className="text-muted">{hodList.length} HOD{hodList.length !== 1 ? "s" : ""} total</small>
        </div>
        <button
          className="btn text-white fw-bold px-4"
          style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "10px" }}
          onClick={openAddModal}
        >
          + Add HOD
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-4" style={{ borderRadius: "12px" }}>
        <input
          className="form-control shadow-sm"
          placeholder="🔍  Search by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CARDS GRID */}
      {filteredHods.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>👤</div>
          <p className="mt-2">No HOD found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredHods.map((hod) => {
            const cfg     = DEPT_COLORS[hod.department] || { bg: "#f8fafc", border: "#94a3b8", badge: "#64748b" };
            const emoji   = DEPT_EMOJI[hod.department] || "🏫";
            const initials = getInitials(hod.name);

            return (
              <div key={hod._id} className="col-md-4 col-sm-6">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "16px",
                    borderLeft: `5px solid ${cfg.border}`,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    background: "white",
                  }}
                  onClick={() => { setSelectedHod(hod); setShowViewCard(true); }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.border}33`;
                    e.currentTarget.style.background = cfg.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <div className="card-body p-4">

                    {/* Avatar + Status */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {/* Avatar circle with initials */}
                      <div
                        style={{
                          width: 52, height: 52, borderRadius: "50%",
                          background: cfg.border,
                          color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "bold", fontSize: "18px", flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>

                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="fw-bold mb-0 text-truncate">{hod.name}</h6>
                        <small className="text-muted">Head of Department</small>
                      </div>

                      {/* Active / Inactive dot */}
                      <span
                        style={{
                          width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: hod.status ? "#22c55e" : "#ef4444",
                          boxShadow: hod.status ? "0 0 6px #22c55e88" : "0 0 6px #ef444488",
                        }}
                        title={hod.status ? "Active" : "Inactive"}
                      />
                    </div>

                    {/* Department Badge */}
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        className="badge"
                        style={{
                          background: cfg.bg,
                          color: cfg.badge,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: "20px",
                          padding: "5px 12px",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {emoji} {hod.department}
                      </span>

                      <span
                        className="badge"
                        style={{
                          background: hod.status ? "#dcfce7" : "#fee2e2",
                          color: hod.status ? "#15803d" : "#dc2626",
                          borderRadius: "20px",
                          padding: "5px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {hod.status ? "Active" : "Inactive"}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewCard && selectedHod && (() => {
        const cfg   = DEPT_COLORS[selectedHod.department] || { bg: "#f8fafc", border: "#94a3b8", badge: "#64748b" };
        const emoji = DEPT_EMOJI[selectedHod.department] || "🏫";
        return (
          <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}
               onClick={() => setShowViewCard(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content shadow-lg border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>

                {/* Colored top strip */}
                <div style={{ height: 8, background: cfg.border }} />

                <div className="modal-body p-4">
                  {/* Avatar + name */}
                  <div className="text-center mb-4">
                    <div
                      style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: cfg.border, color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "bold", fontSize: "26px",
                        margin: "0 auto 12px",
                        boxShadow: `0 4px 16px ${cfg.border}55`,
                      }}
                    >
                      {getInitials(selectedHod.name)}
                    </div>
                    <h4 className="fw-bold mb-1">{selectedHod.name}</h4>
                    <span
                      className="badge"
                      style={{
                        background: cfg.bg, color: cfg.badge,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: "20px", padding: "5px 14px", fontSize: "14px",
                      }}
                    >
                      {emoji} {selectedHod.department}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="p-3 rounded-3 mb-3" style={{ background: "#f8fafc" }}>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Role</span>
                      <span className="fw-bold">Head of Department</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Status</span>
                      <span
                        className="badge"
                        style={{
                          background: selectedHod.status ? "#dcfce7" : "#fee2e2",
                          color: selectedHod.status ? "#15803d" : "#dc2626",
                          borderRadius: "20px", padding: "5px 12px",
                        }}
                      >
                        {selectedHod.status ? "✅ Active" : "❌ Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                  <button className="btn btn-danger px-3" onClick={() => handleDelete(selectedHod._id)}>
                    🗑 Delete
                  </button>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => setShowViewCard(false)}>
                      Close
                    </button>
                    <button
                      className="btn text-white fw-bold px-3"
                      style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                      onClick={() => {
                        setEditingHod(selectedHod);
                        setFormData(selectedHod);
                        setShowViewCard(false);
                        setShowEditModal(true);
                      }}
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 p-3" style={{ borderRadius: "20px" }}>

              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">{editingHod ? "✏️ Edit HOD" : "➕ Add HOD"}</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">HOD Name</label>
                <input
                  className="form-control mb-3 shadow-sm"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <label className="form-label fw-semibold">Department</label>
                <select
                  className="form-select mb-3 shadow-sm"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {["CSE","IT","ECE","MECH","CIVIL","EEE"].map(d => (
                    <option key={d} value={d}>{DEPT_EMOJI[d]} {d}</option>
                  ))}
                </select>

                <div className="form-check form-switch mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
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
                {editingHod && (
                  <button className="btn btn-outline-danger" onClick={() => handleDelete(editingHod._id)}>
                    Delete
                  </button>
                )}
                <div className="ms-auto d-flex gap-2">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
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