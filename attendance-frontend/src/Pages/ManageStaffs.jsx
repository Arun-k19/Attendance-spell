import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageStaffs() {
  const departmentOptions = ["", "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];
  const yearOptions = ["", "1", "2", "3", "4"];
  const roleOptions = ["Faculty", "HOD", "Lab Incharge"];

  const [staffList, setStaffList] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingStaff, setEditingStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    subjects: [{ name: "", year: "" }],
    role: "",
    status: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/staff`);
      setStaffList(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to load staff data!");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.department || !formData.role) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      if (editingStaff) {
        await axios.put(`${BASE_URL}/staff/${editingStaff._id}`, formData);
        alert("Staff updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/staff/add`, formData);
        alert("Staff added successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving staff");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      subjects: [{ name: "", year: "" }],
      role: "",
      status: true,
    });
    setEditingStaff(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      await axios.delete(`${BASE_URL}/staff/${id}`);
      setShowModal(false);
      fetchStaff();
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchYear =
      filterYear ? s.subjects.some((sub) => sub.year === filterYear) : true;

    const matchSearch = searchTerm
      ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjects.some(
          (sub) =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.year.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    return matchDept && matchYear && matchSearch;
  });

  const activeDot = (status) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    display: "inline-block",
    backgroundColor: status ? "#22c55e" : "#f87171",
  });

  return (
    <section className="container py-3" style={{ maxWidth: "1100px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">Manage Staff</h3>
        <button
          className="btn text-white fw-bold px-3"
          style={{
            background: "linear-gradient(90deg,#2563eb,#1e3a8a)",
          }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Staff
        </button>
      </div>

      {/* FILTERS */}
      <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
        <div className="row g-3">

          <div className="col-md-3">
            <select
              className="form-select shadow-sm"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              {departmentOptions.map((d) => (
                <option key={d}>{d || "Department"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select shadow-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y}>{y || "Year"}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <input
              className="form-control shadow-sm"
              placeholder="Search by name, department, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* STAFF TABLE */}
      <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="table-responsive p-3">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: "#2563eb", color: "white" }}>
                <th>Status</th>
                <th>Name</th>
                <th>Dept</th>
                <th>Years</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((staff) => (
                <tr
                  key={staff._id}
                  style={{ cursor: "pointer", transition: "0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  onClick={() => {
                    setEditingStaff(staff);
                    setFormData(staff);
                    setShowModal(true);
                  }}
                >
                  <td><span style={activeDot(staff.status)} /></td>
                  <td>{staff.name}</td>
                  <td>{staff.department}</td>
                  <td>{staff.subjects?.map((s) => s.year).join(", ")}</td>
                  <td>{staff.role}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ADD / EDIT STAFF MODAL */}
      {showModal && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content shadow-lg" style={{ borderRadius: "15px" }}>
              
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-primary">
                  {editingStaff ? "Edit Staff" : "Add Staff"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">

                <input
                  className="form-control shadow-sm mb-3"
                  placeholder="Staff Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <select
                  className="form-select shadow-sm mb-3"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option>Select Department</option>
                  {departmentOptions.filter((d) => d).map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>

                <h6 className="fw-bold">Subjects</h6>
                {formData.subjects.map((sub, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <input
                      className="form-control shadow-sm"
                      placeholder="Subject Name"
                      value={sub.name}
                      onChange={(e) => {
                        const updated = [...formData.subjects];
                        updated[i].name = e.target.value;
                        setFormData({ ...formData, subjects: updated });
                      }}
                    />

                    <select
                      className="form-select shadow-sm"
                      value={sub.year}
                      onChange={(e) => {
                        const updated = [...formData.subjects];
                        updated[i].year = e.target.value;
                        setFormData({ ...formData, subjects: updated });
                      }}
                    >
                      <option value="">Year</option>
                      {yearOptions.filter((y) => y).map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  className="btn btn-outline-success mb-3"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      subjects: [...formData.subjects, { name: "", year: "" }],
                    })
                  }
                >
                  + Add Subject
                </button>

                <select
                  className="form-select shadow-sm mb-3"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option>Select Role</option>
                  {roleOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Active Status</label>
                </div>

              </div>

              <div className="modal-footer d-flex justify-content-between">
                
                {editingStaff && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(editingStaff._id)}
                  >
                    Delete
                  </button>
                )}

                <div>
                  <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
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
