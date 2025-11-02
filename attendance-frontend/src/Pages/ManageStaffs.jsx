import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageStaff() {
  const departmentOptions = ["", "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];
  const yearOptions = ["", "I Year", "II Year", "III Year", "IV Year"];
  const roleOptions = ["Faculty", "HOD", "Lab Incharge"];

  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: "Karthik",
      department: "CSE",
      subjects: [
        { name: "DBMS", year: "II Year" },
        { name: "AI", year: "III Year" },
      ],
      role: "Faculty",
      status: true,
    },
    {
      id: 2,
      name: "Priya",
      department: "IT",
      subjects: [{ name: "Python", year: "II Year" }],
      role: "HOD",
      status: true,
    },
    {
      id: 3,
      name: "Vignesh",
      department: "ECE",
      subjects: [{ name: "DSP", year: "III Year" }],
      role: "Lab Incharge",
      status: false,
    },
  ]);

  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    subjects: [{ name: "", year: "" }],
    role: "",
    status: true,
  });

  const activeDot = (status) => ({
    width: 14,
    height: 14,
    borderRadius: "50%",
    backgroundColor: status ? "#22c55e" : "#facc15",
    display: "inline-block",
  });

  const showToast = (msg) => alert(msg);

  // Filter logic
  const filteredStaff = staffList.filter((s) => {
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchSearch = searchTerm
      ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjects.some((sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;
    const matchYear = filterYear
      ? s.subjects.some((sub) => sub.year === filterYear)
      : true;
    return matchDept && matchYear && matchSearch;
  });

  const deptCounts = departmentOptions
    .filter((d) => d)
    .map((dept) => ({
      dept,
      count: staffList.filter((s) => {
        const matchDept = s.department === dept;
        const matchYear = filterYear
          ? s.subjects.some((sub) => sub.year === filterYear)
          : true;
        return matchDept && matchYear;
      }).length,
    }));

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.department || !formData.role) {
      alert("⚠️ Please fill Name, Department and Role");
      return;
    }

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? { ...formData, id: s.id } : s))
      );
      showToast("Staff updated");
    } else {
      setStaffList((prev) => [{ ...formData, id: Date.now() }, ...prev]);
      showToast("Staff added");
    }

    setFormData({
      name: "",
      department: "",
      subjects: [{ name: "", year: "" }],
      role: "",
      status: true,
    });
    setEditingStaff(null);
    setShowModal(false);
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this staff?")) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      showToast("Staff deleted");
    }
  };

  const resetFilters = () => {
    setFilterDept("");
    setFilterYear("");
    setSearchTerm("");
  };

  return (
    <section className="container my-4">
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

      {/* Stats */}
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="p-3 bg-white rounded shadow-sm text-center">
          <div className="text-muted small">Total Staff</div>
          <div className="fw-bold fs-5">{staffList.length}</div>
        </div>
        <div className="p-3 bg-white rounded shadow-sm text-center">
          <div className="text-muted small">Showing (filtered)</div>
          <div className="fw-bold fs-5">{filteredStaff.length}</div>
        </div>
        <div className="p-3 bg-white rounded shadow-sm flex-grow-1">
          <div className="text-muted small mb-1">
            Department counts {filterYear ? `(for ${filterYear})` : ""}
          </div>
          <div className="d-flex flex-wrap gap-2">
            {deptCounts.map((d) => (
              <span key={d.dept} className="small text-secondary">
                <strong>{d.dept}</strong>: {d.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-light p-3 rounded shadow-sm mb-3">
        <div className="row g-2">
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
                  {y || "Year (optional)"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-primary">
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year(s)</th>
                <th>Role</th>
                <th style={{ width: 140 }}>Action</th>
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
                filteredStaff.map((s) => (
                  <tr key={s.id} onClick={() => setViewStaff(s)} style={{ cursor: "pointer" }}>
                    <td><span style={activeDot(s.status)}></span></td>
                    <td className="fw-semibold">{s.name}</td>
                    <td>{s.department}</td>
                    <td>{[...new Set(s.subjects.map((sub) => sub.year))].join(", ") || "-"}</td>
                    <td>{s.role}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(s);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "90%", maxWidth: 480 }}>
            <h5 className="fw-bold text-primary mb-3">
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h5>

            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="form-control mb-2" placeholder="Staff Name" />

            <select name="department" value={formData.department} onChange={handleChange}
              className="form-select mb-2">
              <option value="">Select Department</option>
              {departmentOptions.filter((d) => d).map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>

            <div className="mb-2">
              <label className="fw-semibold mb-1">Subjects</label>
              {formData.subjects.map((sub, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={sub.name}
                    onChange={(e) => handleSubjectChange(i, "name", e.target.value)}
                    className="form-control"
                  />
                  <select
                    className="form-select"
                    value={sub.year}
                    onChange={(e) => handleSubjectChange(i, "year", e.target.value)}
                  >
                    <option value="">Year</option>
                    {yearOptions.filter((y) => y).map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                  {formData.subjects.length > 1 && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => removeSubject(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button className="btn btn-sm btn-outline-success" onClick={addSubject}>
                + Add Subject
              </button>
            </div>

            <select name="role" value={formData.role} onChange={handleChange}
              className="form-select mb-2">
              <option value="">Select Role</option>
              {roleOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" name="status"
                checked={formData.status} onChange={handleChange} id="statusCheck" />
              <label htmlFor="statusCheck" className="form-check-label">Active</label>
            </div>

            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* View Card Modal */}
      {viewStaff && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "90%", maxWidth: 500 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-0">{viewStaff.name}</h5>
              <span style={activeDot(viewStaff.status)}
                title={viewStaff.status ? "Active" : "Inactive"}></span>
            </div>
            <p><strong>Department:</strong> {viewStaff.department}</p>
            <p><strong>Role:</strong> {viewStaff.role}</p>
            <div>
              <strong>Subjects:</strong>
              <ul className="list-unstyled mt-2">
                {viewStaff.subjects.map((sub, i) => (
                  <li key={i} className="mb-1">
                    <span className="badge bg-primary me-2">{sub.name}</span>
                    <span className="badge bg-secondary">{sub.year}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setViewStaff(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
