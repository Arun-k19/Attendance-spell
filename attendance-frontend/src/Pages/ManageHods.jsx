import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageHods() {
  const [hodList, setHodList] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [searchName, setSearchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHod, setEditingHod] = useState(null);

  const departments = ["CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    status: true,
  });

  // 🟢 Dummy data load
  useEffect(() => {
    setHodList([
      {
        _id: 1,
        name: "Dr. Suresh Kumar",
        department: "CSE",
        status: true,
      },
      {
        _id: 2,
        name: "Dr. Priya Raj",
        department: "ECE",
        status: false,
      },
    ]);
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.department) {
      alert("⚠️ Name மற்றும் Department புலங்களை நிரப்பவும்!");
      return;
    }

    if (editingHod) {
      setHodList(
        hodList.map((h) =>
          h._id === editingHod._id ? { ...formData, _id: editingHod._id } : h
        )
      );
      alert("✅ HOD தகவல் புதுப்பிக்கப்பட்டது!");
    } else {
      setHodList([...hodList, { ...formData, _id: Date.now() }]);
      alert("✅ புதிய HOD சேர்க்கப்பட்டது!");
    }

    setShowModal(false);
    setEditingHod(null);
    setFormData({ name: "", department: "", status: true });
  };

  const handleDelete = (id) => {
    if (window.confirm("இந்த HOD-ஐ நிச்சயமாக நீக்க வேண்டுமா?")) {
      setHodList(hodList.filter((h) => h._id !== id));
    }
  };

  const handleEdit = (hod) => {
    setEditingHod(hod);
    setFormData(hod);
    setShowModal(true);
  };

  const filteredHods = hodList.filter((h) => {
    const matchDept = filterDept ? h.department === filterDept : true;
    const matchName = searchName
      ? h.name.toLowerCase().includes(searchName.toLowerCase())
      : true;
    return matchDept && matchName;
  });

  return (
    <section className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">Manage HODs</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingHod(null);
            setFormData({ name: "", department: "", status: true });
            setShowModal(true);
          }}
        >
          + Add HOD
        </button>
      </div>

      {/* Filter Section */}
      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">Department</option>
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="table table-hover table-bordered">
        <thead className="table-primary">
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredHods.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No HODs Found
              </td>
            </tr>
          ) : (
            filteredHods.map((hod) => (
              <tr key={hod._id}>
                <td>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      display: "inline-block",
                      backgroundColor: hod.status ? "#22c55e" : "#facc15",
                    }}
                  ></span>
                </td>
                <td>{hod.name}</td>
                <td>{hod.department}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(hod)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(hod._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
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
                  placeholder="Name"
                  className="form-control mb-2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <select
                  className="form-select mb-2"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="statusCheck"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
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
    </section>
  );
}
