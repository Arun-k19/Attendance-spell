import axios from "axios";
import React, { useState, useEffect, useRef } from "react";

const BASE       = "https://attendance-spell-management.onrender.com/api/auth";
const BASE_HOD   = "https://attendance-spell-management.onrender.com/api/hod";
const BASE_STAFF = "https://attendance-spell-management.onrender.com/api/staff";

const ROLE_CONFIG = {
  HOD:   { color: "#dc2626", bg: "#fee2e2", emoji: "👑" },
  Staff: { color: "#2563eb", bg: "#eff6ff", emoji: "👨‍🏫" },
  Admin: { color: "#16a34a", bg: "#dcfce7", emoji: "🛡️" },
};

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const emptyUser = () => ({ name: "", role: "Staff", username: "", password: "" });

// ── Role Radio Button Group ──────────────────────────────
const RoleRadioGroup = ({ value, onChange }) => (
  <div className="d-flex gap-2 flex-wrap mb-3">
    {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
      const selected = value === role;
      return (
        <label
          key={role}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "12px",
            border: `2px solid ${selected ? cfg.color : "#e2e8f0"}`,
            background: selected ? cfg.bg : "white",
            fontWeight: selected ? "700" : "500",
            fontSize: "14px",
            color: selected ? cfg.color : "#64748b",
            transition: "all 0.2s",
            userSelect: "none",
          }}
        >
          <input
            type="radio"
            name="role"
            value={role}
            checked={selected}
            onChange={() => onChange(role)}
            style={{ display: "none" }}
          />
          <span style={{ fontSize: "16px" }}>{cfg.emoji}</span>
          {role}
          {selected && (
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: cfg.color, display: "inline-block",
            }} />
          )}
        </label>
      );
    })}
  </div>
);

// ── Status Dot ───────────────────────────────────────────
const StatusDot = ({ active }) => (
  <span style={{
    width: 10, height: 10, borderRadius: "50%",
    display: "inline-block",
    backgroundColor: active ? "#22c55e" : "#ef4444",
    boxShadow: active ? "0 0 5px #22c55e88" : "0 0 5px #ef444488",
  }} />
);

// ── Password field with eye toggle (for forms) ───────────
const PasswordField = ({ value, onChange, placeholder = "Enter password" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group shadow-sm">
      <input
        type={show ? "text" : "password"}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: show ? "inherit" : "monospace", letterSpacing: show ? "normal" : "2px" }}
      />
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => setShow(!show)}
        style={{ fontSize: "16px" }}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
};

// ── Password Display ─────────────────────────────────────
// Plain text display — yellow "not set" if missing
const PasswordDisplay = ({ password }) => {
  const val = password && password.trim() !== "" ? password : null;
  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: "13px",
      background: val ? "#f1f5f9" : "#fef9c3",
      borderRadius: "6px",
      padding: "2px 10px",
      color: val ? "#334155" : "#92400e",
      border: val ? "none" : "1px dashed #fbbf24",
    }}>
      {val ?? "not set"}
    </span>
  );
};

export default function ManageUsers() {
  const [users,           setUsers]           = useState([]);
  const [collegeNames,    setCollegeNames]    = useState([]);
  const [search,          setSearch]          = useState("");
  const [filterRole,      setFilterRole]      = useState("All");
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [showViewModal,   setShowViewModal]   = useState(false);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [newUser,         setNewUser]         = useState(emptyUser());
  const [editData,        setEditData]        = useState({});
  const [loading,         setLoading]         = useState(true);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [nameError,       setNameError]       = useState("");
  const [showDropdown,    setShowDropdown]    = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { loadUsers(); loadCollegeNames(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadCollegeNames = async () => {
    try {
      const [hodRes, staffRes] = await Promise.all([
        axios.get(BASE_HOD),
        axios.get(BASE_STAFF),
      ]);
      const hods  = (hodRes.data  || []).map((h) => ({ name: h.name, role: "HOD"   }));
      const staff = (staffRes.data || []).map((s) => ({ name: s.name, role: "Staff" }));
      setCollegeNames([...hods, ...staff]);
    } catch (err) {
      console.error("Failed to load college names:", err);
    }
  };

  // ── Fetch users ──────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/users`);

      // 🔍 Debug — open browser console to see raw data
      console.log("Raw API response:", res.data);
      if (res.data.length > 0) {
        console.log("First user keys:", Object.keys(res.data[0]));
        console.log("First user full object:", res.data[0]);
      }

      const formatted = res.data.map((u, i) => {
        // Try all possible password field names
        const pwd =
          u.password        ||
          u.plainPassword   ||
          u.plain_password  ||
          u.pass            ||
          u.pwd             ||
          u.userPassword    ||
          "";

        return {
          id:       i + 1,
          name:     u.name || u.username,
          username: u.username,
          password: pwd,
          role:     u.role,
          active:   u.active !== undefined ? u.active : true,
          _raw:     u, // keep raw for debugging
        };
      });

      setUsers(formatted);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Autocomplete ──────────────────────────────────────────
  const handleNameInput = (val) => {
    setNewUser({ ...newUser, name: val });
    setNameError("");
    if (!val.trim()) { setNameSuggestions([]); setShowDropdown(false); return; }
    const matches = collegeNames.filter((u) =>
      u.name.toLowerCase().startsWith(val.toLowerCase())
    );
    setNameSuggestions(matches);
    setShowDropdown(matches.length > 0);
  };

  const handleNameBlur = () => {
    setTimeout(() => {
      const isValid = collegeNames.find(
        (u) => u.name.toLowerCase() === newUser.name.toLowerCase()
      );
      if (newUser.name && !isValid) {
        setNameError("❌ This person is not in our college records");
        setShowDropdown(false);
      }
    }, 150);
  };

  const selectSuggestion = (s) => {
    setNewUser({ ...newUser, name: s.name, role: s.role });
    setNameSuggestions([]);
    setShowDropdown(false);
    setNameError("");
  };

  // ── Filter ────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    const matchRole = filterRole === "All" ? true : u.role === filterRole;
    return matchSearch && matchRole;
  });

  const countByRole = (role) =>
    role === "All" ? users.length : users.filter((u) => u.role === role).length;

  // ── Add ───────────────────────────────────────────────────
  const handleAdd = async () => {
    const isValid = collegeNames.find(
      (u) => u.name.toLowerCase() === newUser.name.toLowerCase()
    );
    if (!isValid)          return alert("❌ User not in our college records!");
    if (!newUser.username) return alert("Enter a username!");
    if (!newUser.password) return alert("Enter a password!");
    try {
      const res = await axios.post(`${BASE}/register`, {
        name:     newUser.name,
        username: newUser.username,
        password: newUser.password,
        role:     newUser.role,
      });
      alert(res.data.msg || "User added!");
      setShowAddModal(false);
      setNewUser(emptyUser());
      setNameError("");
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding user");
    }
  };

  // ── Update ────────────────────────────────────────────────
  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE}/users/${editData.username}`, {
        newUsername: editData.name,
        role:        editData.role,
        active:      editData.active,
        ...(editData.newPassword ? { password: editData.newPassword } : {}),
      });
      alert("Updated!");
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (username) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${BASE}/users/${username}`);
      setShowViewModal(false);
      setShowEditModal(false);
      loadUsers();
    } catch { alert("Delete failed"); }
  };

  // ── Toggle Active ─────────────────────────────────────────
  const handleToggle = async (user) => {
    const updated = { ...user, active: !user.active };
    setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
    if (selectedUser?.id === user.id) setSelectedUser(updated);
    try {
      await axios.put(`${BASE}/users/${user.username}`, { active: updated.active });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? user : u));
    }
  };

  // ── Render ────────────────────────────────────────────────
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
          onClick={() => { setNewUser(emptyUser()); setNameError(""); setShowAddModal(true); }}
        >
          + Add User
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
        <input className="form-control shadow-sm"
          placeholder="🔍  Search by name, username, role..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* ROLE TABS */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {["All", "HOD", "Staff", "Admin"].map((role) => {
          const cfg    = ROLE_CONFIG[role] || {};
          const active = filterRole === role;
          return (
            <button key={role} onClick={() => setFilterRole(role)} style={{
              border: "none", borderRadius: "20px", padding: "6px 16px",
              fontWeight: active ? "700" : "500", cursor: "pointer",
              background: active ? (cfg.color || "#2563eb") : "#f1f5f9",
              color: active ? "white" : "#64748b",
              transition: "all 0.2s", fontSize: "13px",
            }}>
              {role === "All" ? "👤" : cfg.emoji} {role}
              <span className="ms-1 badge" style={{
                background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                color: active ? "white" : "#64748b",
                borderRadius: "20px", fontSize: "11px",
              }}>
                {countByRole(role)}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
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
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", color: "white" }}>
                <tr>
                  <th className="ps-4">Status</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const cfg = ROLE_CONFIG[u.role] || { color: "#6b7280", bg: "#f3f4f6", emoji: "👤" };
                  return (
                    <tr key={u.id}
                      style={{ cursor: "pointer", transition: "0.2s", opacity: u.active ? 1 : 0.55 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = cfg.bg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                      onClick={() => { setSelectedUser(u); setShowViewModal(true); }}
                    >
                      <td className="ps-4"
                          onClick={(e) => { e.stopPropagation(); handleToggle(u); }}
                          title={u.active ? "Click to deactivate" : "Click to activate"}
                          style={{ cursor: "pointer" }}>
                        <StatusDot active={u.active} />
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: cfg.color, color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: "12px", flexShrink: 0,
                          }}>
                            {getInitials(u.name)}
                          </div>
                          <span className="fw-semibold">{u.name}</span>
                        </div>
                      </td>

                      <td style={{ fontFamily: "monospace", color: "#64748b" }}>
                        @{u.username}
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <PasswordDisplay password={u.password} />
                      </td>

                      <td>
                        <span className="badge" style={{
                          background: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.color}`,
                          borderRadius: "20px", padding: "4px 10px",
                        }}>
                          {cfg.emoji} {u.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

                  <div className="rounded-3 p-3" style={{ background: "#f8fafc" }}>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Username</span>
                      <span className="fw-bold" style={{ fontFamily: "monospace" }}>@{selectedUser.username}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="text-muted">Password</span>
                      <PasswordDisplay password={selectedUser.password} />
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Role</span>
                      <span className="fw-bold">{selectedUser.role}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <span className="text-muted">Status</span>
                      <div className="d-flex align-items-center gap-2"
                           style={{ cursor: "pointer" }}
                           onClick={() => handleToggle(selectedUser)}>
                        <StatusDot active={selectedUser.active} />
                        <span style={{
                          fontSize: "13px", fontWeight: "600",
                          color: selectedUser.active ? "#15803d" : "#dc2626",
                        }}>
                          {selectedUser.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                  <button className="btn btn-danger"
                    onClick={() => handleDelete(selectedUser.username)}>🗑 Delete</button>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary"
                      onClick={() => setShowViewModal(false)}>Close</button>
                    <button className="btn text-white fw-bold px-3"
                      style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "8px" }}
                      onClick={() => {
                        setEditData({ ...selectedUser, newPassword: "" });
                        setShowViewModal(false);
                        setShowEditModal(true);
                      }}>✏ Edit</button>
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
                <label className="form-label fw-semibold">Username</label>
                <input className="form-control mb-3 shadow-sm bg-light"
                  value={editData.username} disabled />

                <label className="form-label fw-semibold">Display Name</label>
                <input className="form-control mb-3 shadow-sm"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

                <label className="form-label fw-semibold d-block mb-2">Role</label>
                <RoleRadioGroup
                  value={editData.role}
                  onChange={(role) => setEditData({ ...editData, role })}
                />

                <label className="form-label fw-semibold">
                  New Password <small className="text-muted fw-normal">(blank = no change)</small>
                </label>
                <PasswordField
                  value={editData.newPassword || ""}
                  onChange={(val) => setEditData({ ...editData, newPassword: val })}
                  placeholder="Enter new password"
                />

                <div className="mt-3">
                  <label className="form-label fw-semibold d-block mb-2">Status</label>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ cursor: "pointer", width: "fit-content" }}
                    onClick={() => setEditData({ ...editData, active: !editData.active })}
                  >
                    <StatusDot active={editData.active} />
                    <span style={{
                      fontSize: "14px", fontWeight: "600",
                      color: editData.active ? "#15803d" : "#dc2626",
                    }}>
                      {editData.active ? "✅ Active" : "❌ Inactive"}
                    </span>
                    <small className="text-muted">(click to toggle)</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button className="btn btn-outline-danger"
                  onClick={() => handleDelete(editData.username)}>Delete</button>
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}>Cancel</button>
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
                <h5 className="fw-bold text-primary">➕ Add User</h5>
                <button className="btn-close" onClick={() => { setShowAddModal(false); setNameError(""); }} />
              </div>
              <div className="modal-body">

                <label className="form-label fw-semibold">Name</label>
                <div className="position-relative mb-1" ref={dropdownRef}>
                  <input
                    className={`form-control shadow-sm ${nameError ? "is-invalid" : ""}`}
                    placeholder="Type HOD or Staff name..."
                    value={newUser.name}
                    onChange={(e) => handleNameInput(e.target.value)}
                    onBlur={handleNameBlur}
                    onFocus={() => nameSuggestions.length > 0 && setShowDropdown(true)}
                    autoComplete="off"
                  />
                  {showDropdown && (
                    <div className="position-absolute w-100 shadow-lg"
                      style={{
                        top: "100%", left: 0, zIndex: 9999,
                        background: "white", borderRadius: "10px",
                        border: "1px solid #e2e8f0", overflow: "hidden", marginTop: "4px",
                      }}>
                      {nameSuggestions.map((s, i) => {
                        const cfg = ROLE_CONFIG[s.role] || {};
                        return (
                          <div key={i}
                            className="d-flex align-items-center gap-2 px-3 py-2"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            onMouseDown={() => selectSuggestion(s)}
                          >
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: cfg.color, color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: "bold", fontSize: "13px", flexShrink: 0,
                            }}>
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "14px" }}>{s.name}</div>
                              <small style={{ color: cfg.color }}>{cfg.emoji} {s.role}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {nameError && (
                  <div className="mt-1 mb-2" style={{
                    fontSize: "13px", color: "#dc2626",
                    background: "#fee2e2", borderRadius: "8px", padding: "6px 12px",
                  }}>
                    {nameError}
                  </div>
                )}

                <div className="mb-3" />

                <label className="form-label fw-semibold d-block mb-2">Role</label>
                <RoleRadioGroup
                  value={newUser.role}
                  onChange={(role) => setNewUser({ ...newUser, role })}
                />

                <label className="form-label fw-semibold">Username (Login ID)</label>
                <input className="form-control mb-3 shadow-sm" placeholder="e.g. kumar_cse"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />

                <label className="form-label fw-semibold">Password</label>
                <PasswordField
                  value={newUser.password}
                  onChange={(val) => setNewUser({ ...newUser, password: val })}
                  placeholder="Set password"
                />
                <small className="text-muted mt-1 d-block">
                  🔒 Admin only — password visible for easy management
                </small>
              </div>

              <div className="modal-footer border-0 justify-content-end">
                <button className="btn btn-secondary me-2"
                  onClick={() => { setShowAddModal(false); setNameError(""); }}>Cancel</button>
                <button className="btn text-white fw-bold px-4"
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