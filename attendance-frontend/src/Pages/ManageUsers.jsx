import axios from "axios";
import React, { useState, useEffect } from "react";

const ROLE_CONFIG = {
  HOD:   { color: "#dc2626", bg: "#fee2e2", emoji: "👑" },
  Staff: { color: "#2563eb", bg: "#eff6ff", emoji: "👨‍🏫" },
  Admin: { color: "#16a34a", bg: "#dcfce7", emoji: "🛡️" },
};

export default function ManageUsers() {

  const validCollegeUsers = [
    { name: "Madhuraa", role: "HOD" },
    { name: "Arun", role: "Staff" },
    { name: "Kumar", role: "Staff" },
  ];

  const [users, setUsers] = useState([]);
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

  // ✅ FETCH USERS FROM BACKEND
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "https://attendance-spell-management.onrender.com/api/auth/users"
        );

        const formatted = res.data.map((u, index) => ({
          id: index + 1,
          name: u.username,
          username: u.username,
          role: u.role,
          active: true
        }));

        setUsers(formatted);

      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // ✅ FILTER
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ ADD USER (BACKEND CONNECTED)
  const handleAdd = async () => {
    const isValid = validCollegeUsers.find(
      (u) =>
        u.name.toLowerCase() === newUser.name.toLowerCase() &&
        u.role === newUser.role
    );

    if (!isValid) return alert("❌ Invalid college user");

    if (!newUser.username || !newUser.password) {
      return alert("Fill all fields");
    }

    try {
      const res = await axios.post(
        "https://attendance-spell-management.onrender.com/api/auth/register",
        {
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
          department: "CSE"
        }
      );

      alert(res.data.msg);

      // refresh list
      const updated = await axios.get(
        "https://attendance-spell-management.onrender.com/api/auth/users"
      );

      const formatted = updated.data.map((u, index) => ({
        id: index + 1,
        name: u.username,
        username: u.username,
        role: u.role,
        active: true
      }));

      setUsers(formatted);

      setShowAddModal(false);
      setNewUser({ name: "", role: "Staff", username: "", password: "" });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error adding user");
    }
  };

  // ✅ DELETE (UI மட்டும்)
  const handleDelete = async (username) => {
    try {
      await axios.delete(
        `https://attendance-spell-management.onrender.com/api/auth/users/${username}`
      );

      const res = await axios.get(
        "https://attendance-spell-management.onrender.com/api/auth/users"
      );

      const formatted = res.data.map((u, index) => ({
        id: index + 1,
        name: u.username,
        username: u.username,
        role: u.role,
        active: true
      }));

      setUsers(formatted);
      setShowViewModal(false);

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ✅ TOGGLE ACTIVE
  const toggleStatus = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, active: !u.active } : u
    ));
  };

  // ✅ UPDATE
  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://attendance-spell-management.onrender.com/api/auth/users/${editData.username}`,
        {
          newUsername: editData.name
        }
      );

      const res = await axios.get(
        "https://attendance-spell-management.onrender.com/api/auth/users"
      );

      const formatted = res.data.map((u, index) => ({
        id: index + 1,
        name: u.username,
        username: u.username,
        role: u.role,
        active: true
      }));

      setUsers(formatted);
      setShowEditModal(false);

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
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
            const cfg = ROLE_CONFIG[u.role] || {
              color: "#6b7280",
              bg: "#f3f4f6",
              emoji: "👤"
            };

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