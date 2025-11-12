import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageHODs() {
  const [hodList, setHodList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHod, setEditingHod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [selectedHod, setSelectedHod] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "HOD",
    status: true,
  });

  // 🔹 Load all HODs from backend
  useEffect(() => {
    fetchHod();
  }, []);

  const fetchHod = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/hod`);
      console.log("📦 Fetched HODs:", res.data);
      setHodList(res.data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      alert("Failed to load HOD data!");
    }
  };

  // 🔹 Save or Update
  const handleSave = async () => {
    if (!formData.name || !formData.department) {
      alert("⚠ Please fill all required fields!");
      return;
    }

    try {
      if (editingHod) {
        await axios.put(`${BASE_URL}/hod/${editingHod._id}`, formData);
        alert("✅ HOD updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/hod/add`, formData);
        alert("✅ HOD added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchHod();
    } catch (err) {
      console.error("❌ Save Error:", err);
      alert("Error saving HOD");
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this HOD?")) {
      try {
        await axios.delete(`${BASE_URL}/hod/${id}`);
        alert("🗑 HOD deleted!");
        fetchHod();
      } catch (err) {
        console.error(err);
        alert("Error deleting HOD");
      }
    }
  };

  const handleEdit = (hod) => {
    setEditingHod(hod);
    setFormData({
      name: hod.name,
      department: hod.department,
      role: "HOD",
      status: hod.status,
    });
    setShowModal(true);
  };

  const handleCardView = (hod) => {
    setSelectedHod(hod);
    setShowCard(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      role: "HOD",
      status: true,
    });
    setEditingHod(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔍 Filter (search)
  const filteredHods = hodList.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDot = (status) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: status ? "#22c55e" : "#facc15",
    display: "inline-block",
    marginRight: 6,
  });

  return (
    <section className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">Manage HODs</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add HOD
        </button>
      </div>

      {/* Search */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search HOD by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HOD Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHods.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No HOD found
                  </td>
                </tr>
              ) : (
                filteredHods.map((hod, i) => (
                  <tr
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCardView(hod)}
                  >
                    <td>
                      <span style={activeDot(hod.status)}></span>
                    </td>
                    <td>{hod.name}</td>
                    <td>{hod.department}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(hod);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(hod._id);
                        }}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingHod ? "Edit HOD" : "Add HOD"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="name"
                  className="form-control mb-3"
                  placeholder="HOD Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="department"
                  className="form-control mb-3"
                  placeholder="Department (e.g., CSE)"
                  value={formData.department}
                  onChange={handleChange}
                />
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="form-check-input"
                    id="statusCheck"
                  />
                  <label className="form-check-label" htmlFor="statusCheck">
                    Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card View */}
      {showCard && selectedHod && (
        <div
          className="modal show fade d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setShowCard(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", width: "90%" }}
          >
            <div
              className="card shadow-lg border-0 p-5 rounded-4"
              style={{
                background: "linear-gradient(135deg, #f8fafc, #e0f2fe)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="fw-bold text-primary mb-0">
                  {selectedHod.name}
                </h4>
                <button
                  className="btn-close"
                  onClick={() => setShowCard(false)}
                ></button>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Department</h6>
                <p className="fs-5 fw-semibold text-dark">
                  {selectedHod.department}
                </p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Role</h6>
                <p className="fs-5 fw-semibold text-dark">{selectedHod.role}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-1">Status</h6>
                <span
                  className={`badge ${
                    selectedHod.status ? "bg-success" : "bg-warning text-dark"
                  } fs-6 px-3 py-2`}
                >
                  {selectedHod.status ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-end mt-4">
                <button
                  className="btn btn-outline-danger px-4 py-2"
                  onClick={() => {
                    handleDelete(selectedHod._id);
                    setShowCard(false);
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
