import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  date:       { type: Date,   required: true },
  department: { type: String, required: true },
  year:       { type: Number, required: true },
  period:     { type: Number, required: true },
  subject:    { type: String, required: true },

  // ✅ NEW — who marked & when
  markedBy:   { type: String, default: "" },   // staff username
  markedAt:   { type: Date,   default: Date.now },

  attendance: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status:    { type: String, enum: ["Present", "Absent"], default: "Present" },
    },
  ],
});

export default mongoose.model("Attendance", attendanceSchema);