import React, { useState } from "react";

export default function ManageHODs() {
  const [hods, setHods] = useState([
    { id: 1, name: "Dr. Suresh Kumar", dept: "CSE", email: "suresh@college.edu", phone: "9876543210" },
    { id: 2, name: "Dr. Priya Raj", dept: "ECE", email: "priya@college.edu", phone: "9876543211" },
  ]);

  const [filterDept, setFilterDept] = useState("");
  const departments = ["", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];

  const filtered = filterDept
    ? hods.filter((h) => h.dept.toLowerCase() === filterDept.toLowerCase())
    : hods;

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Manage HODs</h3>
        <div className="text-muted small">Add, edit, or filter Heads of Departments</div>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex gap-2 align-items-center flex-wrap">
          <select
            className="form-select w-auto"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d || "Filter by Department"}
              </option>
            ))}
          </select>
          <button className="btn btn-outline-secondary" onClick={() => setFilterDept("")}>
            Reset
          </button>
          <button
            className="btn btn-primary ms-auto"
            onClick={() => alert("Add HOD modal coming soon!")}
          >
            + Add HOD
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No HODs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((h) => (
                    <tr key={h.id}>
                      <td>{h.id}</td>
                      <td>{h.name}</td>
                      <td>{h.dept}</td>
                      <td>{h.email}</td>
                      <td>{h.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
