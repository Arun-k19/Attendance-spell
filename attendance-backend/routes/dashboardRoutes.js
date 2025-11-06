import express from "express";
import Student from "../models/Student.js";
import Staff from "../models/Staff.js";
import Hod from "../models/Hod.js";

const router = express.Router();

// ✅ Get total counts
router.get("/counts", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalStaffs = await Staff.countDocuments();
    const totalHods = await Hod.countDocuments();

    res.json({
      totalStudents,
      totalStaffs,
      totalHods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
