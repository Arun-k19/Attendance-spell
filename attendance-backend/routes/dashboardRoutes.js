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

router.get("/department-details/:dept", async (req, res) => {
  try {
    const department = req.params.dept.toUpperCase();

    // HOD
    const hod = await Hod.findOne({ department });

    // Students
    const students = await Student.find({ dept: department });

    // Staff
    const staff = await Staff.find({ department });

    // Attendance %
    const attendanceRecords = await Attendance.find({ department });

    let present = 0;
    let total = 0;

    attendanceRecords.forEach((rec) => {
      rec.attendance.forEach((a) => {
        total++;
        if (a.status === "Present") present++;
      });
    });

    const attendancePercent =
      total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      hod: hod?.name || "Not Assigned",
      students: students.map((s) => ({
        name: s.name,
        year: s.year,
      })),
      staff: staff.map((s) => ({
        name: s.name,
      })),
      attendancePercent,
    });

  } catch (err) {
    console.error("❌ Dept Details Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;