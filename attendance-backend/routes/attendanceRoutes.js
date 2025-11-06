import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// ✅ 1. Attendance save
router.post("/save", async (req, res) => {
  try {
    const newAttendance = new Attendance(req.body);
    await newAttendance.save();
    res.status(201).json({ message: "Attendance saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ 2. View attendance by date
router.get("/view", async (req, res) => {
  try {
    const { date, department, year, period } = req.query;
    const attendance = await Attendance.find({ date, department, year, period })
      .populate("attendance.studentId", "name rollno");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ 3. Generate report
router.get("/report", async (req, res) => {
  try {
    const { from, to, department, year } = req.query;

    const records = await Attendance.find({
      department,
      year,
      date: { $gte: new Date(from), $lte: new Date(to) },
    }).populate("attendance.studentId", "name rollno");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
