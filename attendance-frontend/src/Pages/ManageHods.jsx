import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageHODs() {
  const [hodList, setHodList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedHod, setSelectedHod] = useState(null); // For View Card
  const [editingHod, setEditingHod] = useState(null); // For Edit Modal

  const [showViewCard, setShowViewCard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "HOD",
    status: true,
  });

  // Fetch all HODs
  useEffect(() => {
    fetchHods();
  }, []);

  const fetchHods = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/hod`);
      setHodList(res.data || []);
    } catch (err) {
      alert("Failed to load HOD data!");
    }
  };

  // SAVE / UPDATE
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.department.trim()) {
      alert("Please fill all fields!");
      return;
    }

    const payload = {
      name: formData.name,
      department: formData.department,
      role: "HOD",
      status: formData.status,
    };

    try {
      if (editingHod) {
        await axios.put(`${BASE_URL}/hod/${editingHod._id}`, payload);
        alert("HOD Updated!");
      } else {
        await axios.post(`${BASE_URL}/hod/add`, payload);
        alert("HOD Added!");
      }

      fetchHods();
      setShowEditModal(false);
      setEditingHod(null);
    } catch (err) {
      alert("Error saving HOD!");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this HOD?")) return;

    try {
      await axios.delete(`${BASE_URL}/hod/${id}`);
      alert("HOD Deleted!");
      fetchHods();
      setShowViewCard(false);
    } catch (err) {
      alert("Error deleting HOD!");
    }
  };

  // Reset Add Form
  const openAddModal = () => {
    setFormData({
      name: "",
      department: "",
      role: "HOD",
      status: true,
    });
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
        <h3 className="fw-bold text-primary">Manage HODs</h3>

        <button
          className="btn text-white fw-bold px-3"
          style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)" }}
          onClick={openAddModal}
        >
          + Add HOD
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
        <input
          className="form-control shadow-sm"
          placeholder="Search by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="table-responsive p-3">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: "#2563eb", color: "white" }}>
                <th>Status</th>
                <th>Name</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {filteredHods.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">No HOD found</td>
                </tr>
              ) : (
                filteredHods.map((hod) => (
                  <tr
                    key={hod._id}
                    onClick={() => {
                      setSelectedHod(hod);
                      setShowViewCard(true);
                    }}
                    style={{ cursor: "pointer", transition: "0.3s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#eef3ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          display: "inline-block",
                          backgroundColor: hod.status ? "#22c55e" : "#ef4444",
                        }}
                      />
                    </td>
                    <td>{hod.name}</td>
                    <td>{hod.department}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* VIEW DETAILS CARD */}
      {showViewCard && selectedHod && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowViewCard(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-4 shadow-lg" style={{ borderRadius: "15px" }}>
              
              <div className="modal-header border-0">
                <h4 className="fw-bold text-primary">{selectedHod.name}</h4>
                <button className="btn-close" onClick={() => setShowViewCard(false)}></button>
              </div>

              <div className="modal-body">
                <p><b>Department:</b> {selectedHod.department}</p>
                <p><b>Status:</b> {selectedHod.status ? "Active" : "Inactive"}</p>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">
                
                {/* EDIT BUTTON - OPENS EDIT MODAL */}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingHod(selectedHod);
                    setFormData(selectedHod);
                    setShowViewCard(false);
                    setShowEditModal(true);
                  }}
                >
                  ✏ Edit
                </button>

                {/* DELETE */}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedHod._id)}
                >
                  🗑 Delete
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewCard(false)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3 shadow-lg" style={{ borderRadius: "15px" }}>

              <div className="modal-header border-0">
                <h5 className="fw-bold text-primary">
                  {editingHod ? "Edit HOD" : "Add HOD"}
                </h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>

              <div className="modal-body">

                <input
                  className="form-control mb-3 shadow-sm"
                  placeholder="HOD Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <input
                  className="form-control mb-3 shadow-sm"
                  placeholder="Department (Ex: CSE)"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />

                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  />
                  <label className="form-check-label">Active</label>
                </div>

              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">

                {editingHod && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(editingHod._id)}
                  >
                    Delete
                  </button>
                )}

                <div>
                  <button className="btn btn-secondary me-2" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>

                  <button
                    className="btn text-white fw-bold px-3"
                    style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)" }}
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
