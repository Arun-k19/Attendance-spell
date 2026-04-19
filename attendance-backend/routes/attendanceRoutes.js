import express from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

const router = express.Router();

// SAVE ATTENDANCE
router.post("/save", async (req, res) => {
  try {
    const { date, department, year, period, subject, attendance, markedBy } = req.body;

    // ✅ CHECK DUPLICATE
    const existing = await Attendance.findOne({
      date: new Date(date),
      department,
      year,
      period,
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked for this period",
      });
    }

    // Convert regNo -> studentId
    const mapped = await Promise.all(
      attendance.map(async (item) => {
        const student = await Student.findOne({ regNo: item.regNo });
        return {
          studentId: student?._id,
          status:    item.status,
        };
      })
    );

    const newAttendance = new Attendance({
      date,
      department,
      year,
      period,
      subject,
      markedBy:  markedBy || "",   // ✅ staff username
      markedAt:  new Date(),       // ✅ current time
      attendance: mapped,
    });

    await newAttendance.save();

    res.status(201).json({ message: "Attendance saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VIEW ATTENDANCE
router.get("/view", async (req, res) => {
  try {
    const { date, department, year, period } = req.query;

    const query = {
      department,
      year: Number(year),
    };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (period) {
      query.period = Number(period);
    }

    const records = await Attendance.find(query);
    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REPORT
router.get("/report", async (req, res) => {
  try {
    const { from, to, department, year } = req.query;

    const records = await Attendance.find({
      department,
      year,
      date: { $gte: new Date(from), $lte: new Date(to) },
    }).populate("attendance.studentId");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;