import axios from "axios";
import React, { useState, useEffect } from "react";

const BASE = "https://attendance-spell-management.onrender.com/api/auth";

const ROLE_CONFIG = {
  HOD:   { color: "#dc2626", bg: "#fee2e2", emoji: "👑" },
  Staff: { color: "#2563eb", bg: "#eff6ff", emoji: "👨‍🏫" },
  Admin: { color: "#16a34a", bg: "#dcfce7", emoji: "🛡️" },
};

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const emptyUser = () => ({ name: "", role: "Staff", username: "", password: "" });

const fetchAndFormat = async () => {
  const res = await axios.get(`${BASE}/users`);
  return res.data.map((u, i) => ({
    id: i + 1,
    name: u.name || u.username,
    username: u.username,
    role: u.role,
    department: u.department || "-",
    active: u.active !== undefined ? u.active : true,
  }));
};

export default function ManageUsers() {
  const [users,        setUsers]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal,setShowViewModal]= useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal,setShowEditModal]= useState(false);
  const [newUser,      setNewUser]      = useState(emptyUser());
  const [editData,     setEditData]     = useState({});
  const [loading,      setLoading]      = useState(true);
  const [showPass,     setShowPass]     = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAndFormat();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "All" ? true : u.role === filterRole;
    return matchSearch && matchRole;
  });

  const countByRole = (role) =>
    role === "All" ? users.length : users.filter((u) => u.role === role).length;

  // ── Add ─────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newUser.name || !newUser.username || !newUser.password || !newUser.role)
      return alert("Fill all fields!");
    try {
      const res = await axios.post(`${BASE}/register`, {
        name:       newUser.name,
        username:   newUser.username,
        password:   newUser.password,
        role:       newUser.role,
        department: newUser.department || "CSE",
      });
      alert(res.data.msg || "User added!");
      setShowAddModal(false);
      setNewUser(emptyUser());
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding user");
    }
  };

  // ── Update ──────────────────────────────────────────────
  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE}/users/${editData.username}`, {
        newUsername: editData.name,
        role: editData.role,
        ...(editData.newPassword ? { password: editData.newPassword } : {}),
      });
      alert("Updated!");
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async (username) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${BASE}/users/${username}`);
      setShowViewModal(false);
      setShowEditModal(false);
      loadUsers();
    } catch {
      alert("Delete failed");
    }
  };

  // ── Toggle Active ────────────────────────────────────────
  const toggleStatus = async (user) => {
    try {
      await axios.put(`${BASE}/users/${user.username}`, { active: !user.active });
      loadUsers();
    } catch {
      // fallback UI only
      setUsers(users.map((u) => u.id === user.id ? { ...u, active: !u.active } : u));
    }
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-primary mb-0">Manage Users 🔐</h3>
          <small className="text-muted">{users.length} users total</small>
        </div>
        <button
          className="btn text-white fw-bold px-4"
          style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "10px" }}
          onClick={() => { setNewUser(emptyUser()); setShowAddModal(true); }}
        >
          + Add User
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
        <input
          className="form-control shadow-sm"
          placeholder="🔍  Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ROLE FILTER TABS */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {["All", "HOD", "Staff", "Admin"].map((role) => {
          const cfg    = ROLE_CONFIG[role] || { color: "#2563eb", bg: "#eff6ff" };
          const active = filterRole === role;
          return (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                border: "none", borderRadius: "20px", padding: "6px 16px",
                fontWeight: active ? "700" : "500", cursor: "pointer",
                background: active ? (cfg.color || "#2563eb") : "#f1f5f9",
                color: active ? "white" : "#64748b",
                transition: "all 0.2s",
                fontSize: "13px",
              }}
            >
              {role === "All" ? "👤" : ROLE_CONFIG[role]?.emoji} {role}
              <span
                className="ms-1 badge"
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: active ? "white" : "#64748b",
                  borderRadius: "20px", fontSize: "11px",
                }}
              >
                {countByRole(role)}
              </span>
            </button>
          );
        })}
      </div>

      {/* USER CARDS GRID */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>🔐</div>
          <p className="mt-2">No users found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredUsers.map((u) => {
            const cfg = ROLE_CONFIG[u.role] || { color: "#6b7280", bg: "#f3f4f6", emoji: "👤" };
            return (
              <div key={u.id} className="col-md-3 col-sm-6">
                <div
                  className="card border-0 shadow-sm text-center p-4 h-100"
                  style={{
                    borderRadius: "16px", cursor: "pointer",
                    borderTop: `4px solid ${cfg.color}`,
                    transition: "all 0.25s",
                    opacity: u.active ? 1 : 0.6,
                  }}
                  onClick={() => { setSelectedUser(u); setShowViewModal(true); }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.color}33`;
                    e.currentTarget.style.background = cfg.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.background = "white";
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: cfg.color, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "20px",
                    margin: "0 auto 10px",
                    boxShadow: `0 4px 12px ${cfg.color}44`,
                  }}>
                    {getInitials(u.name)}
                  </div>

                  <h6 className="fw-bold mb-1">{u.name}</h6>
                  <small className="text-muted d-block mb-2">@{u.username}</small>

                  <span className="badge" style={{
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.color}`,
                    borderRadius: "20px", padding: "4px 10px", fontSize: "12px",
                  }}>
                    {cfg.emoji} {u.role}
                  </span>

                  {/* Active dot */}
                  <div className="mt-2">
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      display: "inline-block", marginRight: 5,
                      backgroundColor: u.active ? "#22c55e" : "#ef4444",
                      boxShadow: u.active ? "0 0 5px #22c55e88" : "0 0 5px #ef444488",
                    }} />
                    <small style={{ color: u.active ? "#16a34a" : "#dc2626", fontSize: "11px" }}>
                      {u.active ? "Active" : "Inactive"}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW MODAL ─────────────────────────────────────── */}
      {showViewModal && selectedUser && (() => {
        const cfg = ROLE_CONFIG[selectedUser.role] || { color: "#2563eb", bg: "#eff6ff", emoji: "👤" };
        return (
          <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}
               onClick={() => setShowViewModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <div style={{ height: 8, background: cfg.color }} />

                <div className="modal-body p-4">
                  {/* Avatar + Name */}
                  <div className="text-center mb-4">
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: cfg.color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "26px",
                      margin: "0 auto 12px",
                      boxShadow: `0 4px 16px ${cfg.color}55`,
                    }}>
                      {getInitials(selectedUser.name)}
                    </div>
                    <h4 className="fw-bold mb-1">{selectedUser.name}</h4>
                    <span className="badge" style={{
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.color}`,
                      borderRadius: "20px", padding: "5px 14px", fontSize: "13px",
                    }}>
                      {cfg.emoji} {selectedUser.role}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="rounded-3 p-3 mb-3" style={{ background: "#f8fafc" }}>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Username</span>
                      <span className="fw-bold" style={{ fontFamily: "monospace" }}>@{selectedUser.username}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Role</span>
                      <span className="fw-bold">{selectedUser.role}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Status</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge" style={{
                          background: selectedUser.active ? "#dcfce7" : "#fee2e2",
                          color: selectedUser.active ? "#15803d" : "#dc2626",
                          borderRadius: "20px", padding: "5px 12px",
                        }}>
                          {selectedUser.active ? "✅ Active" : "❌ Inactive"}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: "20px", fontSize: "12px" }}
                          onClick={() => { toggleStatus(selectedUser); setShowViewModal(false); }}
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                  <button className="btn btn-danger" onClick={() => handleDelete(selectedUser.username)}>
                    🗑 Delete
                  </button>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>
                      Close
                    </button>
                    <button
                      className="btn text-white fw-bold px-3"
                      style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                      onClick={() => {
                        setEditData({ ...selectedUser, newPassword: "" });
                        setShowViewModal(false);
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

      {/* ── EDIT MODAL ─────────────────────────────────────── */}
      {showEditModal && (
        <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">✏️ Edit User</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold">Username (Login ID)</label>
                <input className="form-control mb-3 shadow-sm bg-light"
                  value={editData.username} disabled />

                <label className="form-label fw-semibold">Display Name</label>
                <input className="form-control mb-3 shadow-sm"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

                <label className="form-label fw-semibold">Role</label>
                <select className="form-select mb-3 shadow-sm"
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                  <option value="HOD">👑 HOD</option>
                  <option value="Staff">👨‍🏫 Staff</option>
                  <option value="Admin">🛡️ Admin</option>
                </select>

                <label className="form-label fw-semibold">
                  New Password <small className="text-muted">(blank = no change)</small>
                </label>
                <div className="input-group shadow-sm">
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={editData.newPassword || ""}
                    onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                  />
                  <button className="btn btn-outline-secondary" type="button"
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button className="btn btn-outline-danger"
                  onClick={() => handleDelete(editData.username)}>Delete</button>
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button
                    className="btn text-white fw-bold px-4"
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
                <h5 className="fw-bold text-primary">➕ Add User</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold">Display Name</label>
                <input className="form-control mb-3 shadow-sm" placeholder="e.g. Dr. Kumar"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

                <label className="form-label fw-semibold">Role</label>
                <select className="form-select mb-3 shadow-sm"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="HOD">👑 HOD</option>
                  <option value="Staff">👨‍🏫 Staff</option>
                  <option value="Admin">🛡️ Admin</option>
                </select>

                <label className="form-label fw-semibold">Username (Login ID)</label>
                <input className="form-control mb-3 shadow-sm" placeholder="e.g. kumar_cse"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />

                <label className="form-label fw-semibold">Password</label>
                <div className="input-group shadow-sm">
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Set password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <button className="btn btn-outline-secondary" type="button"
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-end">
                <button className="btn btn-secondary me-2"
                  onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  className="btn text-white fw-bold px-4"
                  style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                  onClick={handleAdd}>Add User</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}