import express from "express";
import multer from "multer";
import csv from "csvtojson";
import Student from "../models/Student.js";

const router = express.Router();

// ✅ Add Single Student
router.post("/add", async (req, res) => {
  try {
    const { regNo, name, dept, year, attendance } = req.body;

    const existing = await Student.findOne({ regNo });
    if (existing) return res.status(400).json({ msg: "RegNo already exists!" });

    const student = new Student({ regNo, name, dept, year, attendance });
    await student.save();
    res.json({ msg: "✅ Student Added Successfully!", student });
  } catch (err) {
    console.log("❌ Add Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Get All Students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.log("❌ Fetch Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Get Student by RegNo
router.get("/:regNo", async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.params.regNo });
    if (!student) return res.status(404).json({ msg: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Update Student Attendance or Details
router.put("/:regNo", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { regNo: req.params.regNo },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Student not found" });
    res.json({ msg: "✅ Updated Successfully!", updated });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Delete Student
router.delete("/:regNo", async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ regNo: req.params.regNo });
    if (!deleted) return res.status(404).json({ msg: "Student not found" });
    res.json({ msg: "🗑️ Deleted Successfully!" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ CSV Upload Setup
// ✅ Import Students from CS
// ✅ Multer setup — store file temporarily in "uploads/"
const upload = multer({ dest: "uploads/" });
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const results = [];

    // ✅ Read CSV file row by row
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          // ✅ Insert all student data into MongoDB
          await Student.insertMany(results);

          // ✅ Remove the uploaded temp file
          fs.unlinkSync(filePath);

          res.json({ msg: "✅ Students uploaded successfully!" });
        } catch (dbErr) {
          console.error("❌ Database Insert Error:", dbErr);
          res.status(500).json({ msg: "Database insert failed", error: dbErr.message });
        }
      });
  } catch (err) {
    console.error("❌ CSV Upload Error:", err);
    res.status(500).json({ msg: "CSV upload failed", error: err.message });
  }
});

export default router;
