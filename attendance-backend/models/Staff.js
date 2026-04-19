import mongoose from "mongoose";

// --- Subject Schema ---
const subjectSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  year:       { type: String, required: true },
  department: { type: String, default: "" },  // ✅ NEW — per-subject department
});

// --- Staff Schema ---
const staffSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    department: { type: String, required: true },
    role: {
      type: String,
      enum: ["Faculty", "HOD", "Lab Incharge"],
      required: true,
    },
    subjects: [subjectSchema],
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;