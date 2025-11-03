import express from "express";
import Hod from "../models/Hod.js";

const router = express.Router();

// ➕ Add New HOD
router.post("/add", async (req, res) => {
  try {
    const { name, department, status } = req.body;

    if (!name || !department) {
      return res.status(400).json({ message: "Name and Department are required" });
    }

    const newHod = new Hod({ name, department, status });
    await newHod.save();

    res.status(201).json({ message: "HOD added successfully", hod: newHod });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 Get All HODs (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { department, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (search) query.name = new RegExp(search, "i");

    const hodList = await Hod.find(query);
    res.json(hodList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧾 Get Single HOD
router.get("/:id", async (req, res) => {
  try {
    const hod = await Hod.findById(req.params.id);
    if (!hod) return res.status(404).json({ message: "HOD not found" });
    res.json(hod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update HOD
router.put("/:id", async (req, res) => {
  try {
    const { name, department, status } = req.body;

    const updatedHod = await Hod.findByIdAndUpdate(
      req.params.id,
      { name, department, status },
      { new: true }
    );

    if (!updatedHod) return res.status(404).json({ message: "HOD not found" });

    res.json({ message: "HOD updated successfully", hod: updatedHod });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete HOD
router.delete("/:id", async (req, res) => {
  try {
    const deletedHod = await Hod.findByIdAndDelete(req.params.id);
    if (!deletedHod) return res.status(404).json({ message: "HOD not found" });
    res.json({ message: "HOD deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
