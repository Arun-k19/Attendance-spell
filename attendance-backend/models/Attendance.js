import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  attendance: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      status: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Present",
      },
    },
  ],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
