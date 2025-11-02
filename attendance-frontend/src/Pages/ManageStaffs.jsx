import React, { useState, useEffect } from "react";

const ManageStaff = () => {
  // Dropdown department options
  const departmentOptions = ["CSE", "ECE", "EEE", "IT", "MECH", "CIVIL"];
  const roleOptions = ["Faculty", "HOD", "Admin"];
  const yearSectionOptions = [
    "I Year A",
    "I Year B",
    "II Year A",
    "II Year B",
    "III Year A",
    "III Year B",
    "IV Year A",
    "IV Year B",
  ];

  // Mock data for demo
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: "Karthik",
      department: "CSE",
      subjects: "DBMS, AI",
      yearSection: "III Year A",
      role: "Faculty",
      status: true,
    },
    {
      id: 2,
      name: "Priya",
      department: "IT",
      subjects: "Python, Cloud",
      yearSection: "II Year B",
      role: "HOD",
      status: true,
    },
  ]);

  const [filterDept, setFilterDept] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    subjects: "",
    yearSection: "",
    role: "",
    status: true,
  });

  // Filter staff by department
  const filteredStaff =
    filterDept === "all"
      ? staffList
      : staffList.filter((s) => s.department === filterDept);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save staff (add or update)
  const handleSave = () => {
    if (formData.name.trim() === "") {
      alert("Name is required");
      return;
    }

    if (editingStaff) {
      setStaffList(
        staffList.map((s) =>
          s.id === editingStaff.id ? { ...formData, id: s.id } : s
        )
      );
    } else {
      setStaffList([
        ...staffList,
        { ...formData, id: Date.now() }, // random ID
      ]);
    }

    setFormData({
      name: "",
      department: "",
      subjects: "",
      yearSection: "",
      role: "",
      status: true,
    });
    setEditingStaff(null);
    setShowModal(false);
  };

  // Edit staff
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  // Delete staff
  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this staff?")) {
      setStaffList(staffList.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Staff
        </h1>
        <button
          onClick={() => {
            setEditingStaff(null);
            setFormData({
              name: "",
              department: "",
              subjects: "",
              yearSection: "",
              role: "",
              status: true,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Staff
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center space-x-2">
        <label className="text-gray-700 font-semibold">
          Filter by Department:
        </label>
        <select
          className="border p-2 rounded-md"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-200 text-gray-900">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Department</th>
              <th className="py-2 px-4 text-left">Subjects</th>
              <th className="py-2 px-4 text-left">Year & Section</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((s) => (
                <tr
                  key={s.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{s.name}</td>
                  <td className="py-2 px-4">{s.department}</td>
                  <td className="py-2 px-4">{s.subjects}</td>
                  <td className="py-2 px-4">{s.yearSection}</td>
                  <td className="py-2 px-4">{s.role}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h2>

            {/* Form Fields */}
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Staff Name"
                className="w-full border p-2 rounded"
              />

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="Subjects handled (comma separated)"
                className="w-full border p-2 rounded"
              />

              <select
                name="yearSection"
                value={formData.yearSection}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Year & Section</option>
                {yearSectionOptions.map((ys) => (
                  <option key={ys} value={ys}>
                    {ys}
                  </option>
                ))}
              </select>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Role</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                />
                <label>Active</label>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
