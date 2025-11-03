import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config"; // example: export default "http://localhost:3001/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageStaffs() {
  const departmentOptions = ["CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];
  const yearOptions = ["I Year", "II Year", "III Year", "IV Year"];
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

  // 🧠 Fetch staff on load
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

  // 💾 Add / Update staff
  const handleSave = async () => {
    if (!formData.name || !formData.department || !formData.role) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      if (editingStaff) {
        await axios.put(`${BASE_URL}/staff/${editingStaff._id}`, formData);
        alert("✅ Staff updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/staff/add`, formData);
        alert("✅ Staff added successfully!");
      }

      setShowModal(false);
      setFormData({
        name: "",
        department: "",
        subjects: [{ name: "", year: "" }],
        role: "",
        status: true,
      });
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Error saving staff");
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      await axios.delete(`${BASE_URL}/staff/${id}`);
      fetchStaff();
    }
  };

  // 🧭 Edit
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index][field] = value;
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: "", year: "" }],
    });
  };

  const removeSubject = (index) => {
    const updated = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: updated });
  };

  // 🔍 Filters
  const filteredStaff = staffList.filter((s) => {
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchYear = filterYear
      ? s.subjects.some((sub) => sub.year === filterYear)
      : true;
    const matchSearch = searchTerm
      ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjects.some((sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;
    return matchDept && matchYear && matchSearch;
  });

  const resetFilters = () => {
    setFilterDept("");
    setFilterYear("");
    setSearchTerm("");
  };

  const activeDot = (status) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: status ? "#22c55e" : "#facc15",
    display: "inline-block",
  });

  return (
    <section className="container my-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">Manage Staff</h3>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={resetFilters}>
            Reset Filters
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingStaff(null);
              setFormData({
                name: "",
                department: "",
                subjects: [{ name: "", year: "" }],
                role: "",
                status: true,
              });
              setShowModal(true);
            }}
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="d-flex mb-3 gap-2">
        <select
          className="form-select"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">Department</option>
          {departmentOptions.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Year</option>
          {yearOptions.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Search by name or subject"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <table className="table table-bordered table-hover">
        <thead className="table-primary">
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Department</th>
            <th>Year(s)</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.map((staff) => (
            <tr key={staff._id}>
              <td>
                <span style={activeDot(staff.status)}></span>
              </td>
              <td>{staff.name}</td>
              <td>{staff.department}</td>
              <td>{staff.subjects.map((s) => s.year).join(", ")}</td>
              <td>{staff.role}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(staff)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(staff._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStaff ? "Edit Staff" : "Add Staff"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Name */}
                <input
                  type="text"
                  name="name"
                  className="form-control mb-2"
                  placeholder="Staff Name"
                  value={formData.name}
                  onChange={handleChange}
                />

                {/* Department */}
                <select
                  className="form-select mb-2"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>

                {/* Subjects */}
                <h6>Subjects</h6>
                {formData.subjects.map((sub, index) => (
                  <div key={index} className="d-flex mb-2 gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Subject Name"
                      value={sub.name}
                      onChange={(e) =>
                        handleSubjectChange(index, "name", e.target.value)
                      }
                    />
                    <select
                      className="form-select"
                      value={sub.year}
                      onChange={(e) =>
                        handleSubjectChange(index, "year", e.target.value)
                      }
                    >
                      <option value="">Year</option>
                      {yearOptions.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                    {formData.subjects.length > 1 && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => removeSubject(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn btn-outline-success mb-3" onClick={addSubject}>
                  + Add Subject
                </button>

                {/* Role */}
                <select
                  className="form-select mb-3"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                {/* Status */}
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
    </section>
  );
}
