import React, { useState, useEffect } from "react";
import { Table, Button, Form, Card } from "react-bootstrap";

export default function ManageStaff() {
  const LS_KEY = "admin_staff_data_v1";
  const DEPARTMENTS = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];

  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", department: "", email: "" });
  const [editIndex, setEditIndex] = useState(null);

  // Load from LocalStorage when component loads
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setStaffs(JSON.parse(stored));
  }, []);

  // Save to LocalStorage whenever staffs change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(staffs));
  }, [staffs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = () => {
    if (!form.name || !form.department || !form.email) {
      alert("Please fill all fields");
      return;
    }

    if (editIndex !== null) {
      // Update
      const updated = [...staffs];
      updated[editIndex] = form;
      setStaffs(updated);
      setEditIndex(null);
    } else {
      // Add
      setStaffs([...staffs, form]);
    }

    setForm({ name: "", department: "", email: "" });
  };

  const handleEdit = (index) => {
    setForm(staffs[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure to delete this staff?")) {
      const filtered = staffs.filter((_, i) => i !== index);
      setStaffs(filtered);
    }
  };

  const filteredStaffs = staffs.filter((staff) =>
    staff.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-center">Manage Staff</h3>

      <Card className="p-3 shadow-sm mb-4">
        <Form>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Control
                type="text"
                placeholder="Staff Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <Form.Select
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Control
                type="email"
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="text-center mt-3">
            <Button variant={editIndex !== null ? "warning" : "primary"} onClick={handleAddOrUpdate}>
              {editIndex !== null ? "Update Staff" : "Add Staff"}
            </Button>
          </div>
        </Form>
      </Card>

      <div className="d-flex justify-content-between mb-2">
        <Form.Control
          type="text"
          placeholder="Search by name..."
          className="w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>Total Staff: <strong>{staffs.length}</strong></div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr className="text-center">
            <th>#</th>
            <th>Name</th>
            <th>Department</th>
            <th>Email</th>
            <th style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaffs.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No staff found
              </td>
            </tr>
          ) : (
            filteredStaffs.map((staff, index) => (
              <tr key={index} className="text-center align-middle">
                <td>{index + 1}</td>
                <td>{staff.name}</td>
                <td>{staff.department}</td>
                <td>{staff.email}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(index)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
