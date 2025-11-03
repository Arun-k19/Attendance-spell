import express from "express";
import Staff from "../models/Staff.js";

const router = express.Router();

// ➕ Add new staff
router.post("/add", async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 📋 Get all staff (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { department, year, search } = req.query;

    let query = {};
    if (department) query.department = department;
    if (search) query.name = new RegExp(search, "i");

    let staffList = await Staff.find(query);

    if (year) {
      staffList = staffList.filter((s) =>
        s.subjects.some((sub) => sub.year === year)
      );
    }

    res.json(staffList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📝 Update staff
router.put("/:id", async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ❌ Delete staff
router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single staff
router.get("/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
