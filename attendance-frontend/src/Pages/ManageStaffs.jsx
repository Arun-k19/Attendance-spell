import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageStaffs() {
  const departmentOptions = ["", "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];
  const yearOptions = ["", "I Year", "II Year", "III Year", "IV Year"];
  const roleOptions = ["Faculty", "HOD", "Lab Incharge"];

  const [staffList, setStaffList] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);

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
        alert("✅ Staff updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/staff/add`, formData);
        alert("✅ Staff added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Error saving staff");
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
      fetchStaff();
    }
  };

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

  // 🔍 Filter & Search
  const filteredStaff = staffList.filter((s) => {
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchYear = filterYear
      ? s.subjects.some((sub) => sub.year === filterYear)
      : true;
    const matchSearch = searchTerm
      ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjects.some(
          (sub) =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.year.toLowerCase().includes(searchTerm.toLowerCase())
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

  // 🧮 Department-wise count
  const totalStaff = staffList.length;
  const deptCounts = departmentOptions
    .filter((d) => d)
    .map((dept) => ({
      name: dept,
      count: staffList.filter((s) => s.department === dept).length,
    }));

  return (
    <section className="container py-3">
      {/* Header */}
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
              resetForm();
              setShowModal(true);
            }}
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Total Staff + Department Count */}
      <div className="card border-0 shadow-sm p-3 mb-3">
        <h5 className="fw-bold text-secondary mb-2">
          Total Staff: <span className="text-primary">{totalStaff}</span>
        </h5>
        <div className="d-flex flex-wrap gap-2">
          {deptCounts.map((d) => (
            <span key={d.name} className="badge bg-light text-dark border">
              {d.name}: {d.count}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body row g-2 align-items-center">
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d || "Department"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y || "Year"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, department, subject, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No staff found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, i) => (
                  <tr
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => setViewStaff(staff)}
                  >
                    <td>
                      <span style={activeDot(staff.status)}></span>
                    </td>
                    <td>{staff.name}</td>
                    <td>{staff.department}</td>
                    <td>
                      {staff.subjects && staff.subjects.length > 0
                        ? staff.subjects
                            .map((sub) => sub.year)
                            .filter((year) => year)
                            .join(", ")
                        : "N/A"}
                    </td>
                    <td>{staff.role}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(staff);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(staff._id);
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

      {/* Staff Detail Modal */}
      {viewStaff && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3 position-relative">
              <span
                style={{
                  ...activeDot(viewStaff.status),
                  position: "absolute",
                  top: 15,
                  right: 20,
                }}
              ></span>

              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-primary fw-bold">
                  {viewStaff.name}
                </h5>
              </div>
              <div className="modal-body">
                <p className="mb-1">
                  <strong>Department:</strong> {viewStaff.department}
                </p>
                <p className="mb-1">
                  <strong>Role:</strong> {viewStaff.role}
                </p>
                <div className="mt-3">
                  <strong>Subjects:</strong>
                  <div className="mt-2 d-flex flex-column gap-1">
                    {viewStaff.subjects.map((sub, i) => (
                      <div key={i}>
                        {sub.name ? (
                          <span>
                            {sub.name}{" "}
                            <span className="text-muted small">
                              ({sub.year})
                            </span>
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewStaff(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <input
                  type="text"
                  name="name"
                  className="form-control mb-2"
                  placeholder="Staff Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <select
                  className="form-select mb-2"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departmentOptions
                    .filter((d) => d)
                    .map((dept) => (
                      <option key={dept}>{dept}</option>
                    ))}
                </select>

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
                      {yearOptions
                        .filter((y) => y)
                        .map((y) => (
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
                <button
                  className="btn btn-outline-success mb-3"
                  onClick={addSubject}
                >
                  + Add Subject
                </button>

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
