import express from "express";
import Student from "../models/Student.js";
import Staff from "../models/Staff.js";
import Hod from "../models/Hod.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();


// =========================
// ADMIN DASHBOARD COUNTS
// =========================
router.get("/admin-counts", async (req, res) => {
  try {
    const totalHods = await Hod.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalStudents = await Student.countDocuments();

    // Today Attendance %
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = await Attendance.find({
      date: { $gte: today }
    });

    let present = 0;
    let totalMarked = 0;

    attendanceToday.forEach((record) => {
      record.attendance.forEach((a) => {
        totalMarked++;
        if (a.status === "Present") present++;
      });
    });

    const attendancePercent =
      totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

    res.json({
      totalStudents,
      totalStaff,
      totalHods,
      attendancePercent
    });

  } catch (error) {
    console.error("❌ Admin Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// =========================
// HOD DASHBOARD COUNTS
// =========================
router.get("/hod-counts/:department", async (req, res) => {
  try {
    const department = req.params.department.toUpperCase();

    const totalStudents = await Student.countDocuments({ dept: department });
    const totalStaff = await Staff.countDocuments({ department });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = await Attendance.find({
      department,
      date: { $gte: today }
    });

    let present = 0;
    let totalMarked = 0;

    attendanceToday.forEach((record) => {
      record.attendance.forEach((a) => {
        totalMarked++;
        if (a.status === "Present") present++;
      });
    });

    const attendancePercent =
      totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

    res.json({
      totalStudents,
      totalStaff,
      attendancePercent
    });

  } catch (error) {
    console.error("❌ HOD Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;