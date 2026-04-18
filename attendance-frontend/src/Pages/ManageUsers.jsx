import React, { useState } from "react";

const ROLE_CONFIG = {
  HOD:   { color: "#dc2626", bg: "#fee2e2", emoji: "👑" },
  Staff: { color: "#2563eb", bg: "#eff6ff", emoji: "👨‍🏫" },
};

export default function ManageUsers() {

  const validCollegeUsers = [
    { name: "Madhuraa", role: "HOD" },
    { name: "Arun", role: "Staff" },
    { name: "Kumar", role: "Staff" },
  ];

  const [users, setUsers] = useState([
    { id: 1, name: "Madhuraa", role: "HOD", username: "hod1", password: "1234", active: true },
    { id: 2, name: "Arun", role: "Staff", username: "staff1", password: "1234", active: true },
  ]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    role: "Staff",
    username: "",
    password: "",
  });

  const [editData, setEditData] = useState({});

  // ✅ FILTER (FIXED)
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ ADD USER
  const handleAdd = () => {
    const isValid = validCollegeUsers.find(
      (u) =>
        u.name.toLowerCase() === newUser.name.toLowerCase() &&
        u.role === newUser.role
    );

    if (!isValid) return alert("❌ Invalid college user");

    if (!newUser.username || !newUser.password) {
      return alert("Fill all fields");
    }

    setUsers([
      ...users,
      { id: Date.now(), ...newUser, active: true }
    ]);

    alert("✅ User created successfully");

    setShowAddModal(false);
    setNewUser({ name: "", role: "Staff", username: "", password: "" });
  };

  // ✅ DELETE
  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    setShowViewModal(false);
  };

  // ✅ TOGGLE ACTIVE
  const toggleStatus = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, active: !u.active } : u
    ));
  };

  // ✅ UPDATE
  const handleUpdate = () => {
    setUsers(users.map((u) =>
      u.id === editData.id ? editData : u
    ));
    setShowEditModal(false);
  };

  return (
    <div className="container mt-4">

      <h3 className="fw-bold text-primary mb-3">Manage Users 🔐</h3>

      {/* SEARCH */}
      <div className="card p-3 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <input
          className="form-control"
          placeholder="🔍 Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ADD BUTTON */}
      <button
        className="btn text-white fw-bold mb-4"
        style={{
          background: "linear-gradient(90deg,#2563eb,#1e3a8a)",
          borderRadius: "10px"
        }}
        onClick={() => setShowAddModal(true)}
      >
        + Add User
      </button>

      {/* USER CARDS */}
      {filteredUsers.length === 0 ? (
        <div className="text-center text-muted">No users found</div>
      ) : (
        <div className="row">
          {filteredUsers.map((u) => {
            const cfg = ROLE_CONFIG[u.role];
            return (
              <div className="col-md-3 mb-3" key={u.id}>
                <div
                  className="card p-3 text-center shadow-sm"
                  style={{
                    borderRadius: "16px",
                    cursor: "pointer",
                    borderTop: `4px solid ${cfg.color}`,
                  }}
                  onClick={() => {
                    setSelectedUser(u);
                    setShowViewModal(true);
                  }}
                >
                  <div style={{ fontSize: 28 }}>{cfg.emoji}</div>
                  <h6 className="fw-bold mt-2">{u.name}</h6>
                  <span
                    className="badge"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedUser && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowViewModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-4" style={{ borderRadius: "20px" }}>

              <h4 className="fw-bold text-center">{selectedUser.name}</h4>

              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>Username:</b> {selectedUser.username}</p>
              <p>
                <b>Status:</b>{" "}
                <span className={`badge ${selectedUser.active ? "bg-success" : "bg-secondary"}`}>
                  {selectedUser.active ? "Active" : "Inactive"}
                </span>
              </p>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    setEditData(selectedUser);
                    setShowViewModal(false);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => toggleStatus(selectedUser.id)}
                >
                  Toggle Active
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4" style={{ borderRadius: "20px" }}>
              <h5>Add User</h5>

              <input className="form-control mb-2" placeholder="Name"
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

              <select className="form-control mb-2"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option>HOD</option>
                <option>Staff</option>
              </select>

              <input className="form-control mb-2" placeholder="Username"
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />

              <input type="password" className="form-control mb-3" placeholder="Password"
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />

              <button className="btn btn-primary w-100" onClick={handleAdd}>
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4" style={{ borderRadius: "20px" }}>
              <h5>Edit User</h5>

              <input
                className="form-control mb-2"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />

              <button className="btn btn-success w-100" onClick={handleUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}