import express from "express";
import multer from "multer";
import csv from "csvtojson";
import fs from "fs";
import Student from "../models/Student.js";

const router = express.Router();

/* =============================
   📦 MULTER File Upload Setup
============================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* =============================
   📥 CSV UPLOAD (with Auto Mapping)
============================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { dept, year } = req.body;
    if (!req.file) return res.status(400).json({ msg: "❌ No file uploaded" });

    const filePath = req.file.path;
    const jsonArray = await csv().fromFile(filePath);

    if (!jsonArray || jsonArray.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ msg: "❌ Empty or invalid CSV file" });
    }

    // Normalize headers (case-insensitive)
    const normalize = (obj) => {
      const newObj = {};
      for (let key in obj) {
        newObj[key.trim().toLowerCase()] = obj[key];
      }
      return newObj;
    };

    // Auto map flexible CSV headers
    const formattedData = jsonArray.map((row) => {
      const data = normalize(row);
      return {
        regNo:
          data["regno"] ||
          data["reg no"] ||
          data["register no"] ||
          data["student id"] ||
          data["id"] ||
          "",
        name: data["name"] || data["student name"] || data["full name"] || "",
        dept:
          dept ||
          data["dept"] ||
          data["department"] ||
          data["department name"] ||
          "",
        year: year || data["year"] || data["batch year"] || "",
        attendance: Number(data["attendance"] || 0),
      };
    });

    // Validate records
    const validStudents = formattedData.filter(
      (s) => s.regNo && s.name && s.dept && s.year
    );

    if (!validStudents.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        msg: "❌ Invalid CSV format. Required headers: regNo, name, dept, year, attendance",
      });
    }

    await Student.insertMany(validStudents);
    fs.unlinkSync(filePath);

    res.json({
      msg: `✅ ${validStudents.length} students uploaded successfully!`,
      count: validStudents.length,
      data: validStudents,
    });
  } catch (err) {
    console.error("❌ CSV Upload Error:", err);
    res.status(500).json({ msg: "CSV upload failed", error: err.message });
  }
});

/* =============================
   📚 GET Students (Filter by Dept/Year)
============================= */
router.get("/", async (req, res) => {
  try {
    const { dept, year } = req.query;
    const query = {};

    if (dept) query.dept = dept;
    if (year) query.year = year;

    const students = await Student.find(query).sort({ regNo: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch students" });
  }
});

/* =============================
   🔍 SEARCH Students (by name/regNo/dept/year)
============================= */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");
    const students = await Student.find({
      $or: [
        { name: regex },
        { regNo: regex },
        { dept: regex },
        { year: regex },
      ],
    }).sort({ name: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "Search failed" });
  }
});

/* =============================
   ➕ ADD Student (Manual)
============================= */
router.post("/add", async (req, res) => {
  try {
    const { regNo, name, dept, year, attendance } = req.body;
    if (!regNo || !name || !dept || !year)
      return res.status(400).json({ msg: "All fields required" });

    const exist = await Student.findOne({ regNo });
    if (exist) return res.status(400).json({ msg: "Student already exists" });

    const student = new Student({
      regNo,
      name,
      dept,
      year,
      attendance: attendance || 0,
    });
    await student.save();
    res.json({ msg: "✅ Student added successfully", student });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add student" });
  }
});

/* =============================
   ✏️ UPDATE Student
============================= */
router.put("/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;
    const update = req.body;
    const updated = await Student.findOneAndUpdate({ regNo }, update, {
      new: true,
    });
    if (!updated) return res.status(404).json({ msg: "Student not found" });
    res.json({ msg: "✅ Updated successfully", updated });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update student" });
  }
});

/* =============================
   🗑️ DELETE Student
============================= */
router.delete("/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;
    const deleted = await Student.findOneAndDelete({ regNo });
    if (!deleted) return res.status(404).json({ msg: "Student not found" });
    res.json({ msg: "🗑️ Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;
