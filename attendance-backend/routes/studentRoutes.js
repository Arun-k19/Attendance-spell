import express from "express";
import multer from "multer";
import csv from "csvtojson";
import fs from "fs";
import Student from "../models/Student.js";
import XLSX from "xlsx";

const router = express.Router();

/* =============================
   📦 MULTER Setup
============================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* =============================
   📥 CSV + EXCEL UPLOAD (FINAL 🔥)
============================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "❌ No file uploaded" });
    }

    const filePath = req.file.path;
    let jsonArray = [];

    // 🔥 FILE TYPE CHECK
    if (req.file.originalname.endsWith(".csv")) {
      jsonArray = await csv().fromFile(filePath);

    } else if (
      req.file.originalname.endsWith(".xlsx") ||
      req.file.originalname.endsWith(".xls")
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      jsonArray = XLSX.utils.sheet_to_json(sheet);

    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        msg: "❌ Only CSV or Excel files allowed",
      });
    }

    if (!jsonArray.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ msg: "❌ File is empty" });
    }

    // 🔥 normalize headers
    const normalize = (obj) => {
      const newObj = {};
      for (let key in obj) {
        newObj[key.trim().toLowerCase()] = obj[key];
      }
      return newObj;
    };

    // 🔥 FINAL MAPPING (handles ALL formats)
    const formattedData = jsonArray.map((row) => {
      const data = normalize(row);

      return {
        regNo:
          data["regno"] ||
          data["reg no"] ||
          data["register no"] ||
          data["id"] ||
          data["reg_no"] ||
          data["register"] ||
          "",

        name:
          data["name"] ||
          data["student name"] ||
          data["student"] ||
          "",

        dept: (
          data["dept"] ||
          data["department"] ||
          data["dept "] ||
          data[" department"] ||
          data["branch"]
        )?.toString().trim().toUpperCase() || "",

        year:
          data["year"] ||
          data["yr"] ||
          data["year "] ||
          "",

        attendance: Number(data["attendance"] || 0),
      };
    });

    const validStudents = formattedData.filter(
      (s) => s.regNo && s.name && s.dept && s.year
    );

    if (!validStudents.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        msg: "❌ File format wrong (need regNo, name, dept, year)",
      });
    }

    // 🔥 insert (skip duplicates)
    await Student.insertMany(validStudents, { ordered: false });

    fs.unlinkSync(filePath);

    res.json({
      msg: `✅ ${validStudents.length} students uploaded successfully`,
      count: validStudents.length,
    });

  } catch (err) {
    console.error("❌ Upload Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        msg: "⚠️ Some students already exist (duplicate regNo)",
      });
    }

    res.status(500).json({
      msg: "Upload failed",
      error: err.message,
    });
  }
});

/* =============================
   GET ALL STUDENTS
============================= */
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ regNo: 1 });
    res.json(students);
  } catch {
    res.status(500).json({ msg: "Fetch failed" });
  }
});

/* =============================
   ADD STUDENT
============================= */
router.post("/add", async (req, res) => {
  try {
    const { regNo, name, dept, year } = req.body;

    if (!regNo || !name || !dept || !year) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const exist = await Student.findOne({ regNo });
    if (exist) {
      return res.status(400).json({ msg: "Student exists" });
    }

    const student = new Student({ regNo, name, dept, year });
    await student.save();

    res.json({ msg: "Student added", student });
  } catch {
    res.status(500).json({ msg: "Add failed" });
  }
});

/* =============================
   ✏️ UPDATE STUDENT (FIXED)
============================= */
router.put("/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;
    const { name, dept, year, attendance } = req.body;

    const updated = await Student.findOneAndUpdate(
      { regNo: new RegExp(`^${regNo}$`, "i") }, // 🔥 case insensitive
      { name, dept, year, attendance },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Student not found" });
    }

    res.json({ msg: "Student updated", student: updated });
  } catch {
    res.status(500).json({ msg: "Update failed" });
  }
});

/* =============================
   ❌ DELETE STUDENT
============================= */
router.delete("/:regNo", async (req, res) => {
  try {
    await Student.findOneAndDelete({
      regNo: new RegExp(`^${req.params.regNo}$`, "i"),
    });
    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;