import mongoose from "mongoose";

// --- Subject Schema ---
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: String, required: true }, // e.g., "II Year"
});

// --- Staff Schema ---
const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    role: {
      type: String,
      enum: ["Faculty", "HOD", "Lab Incharge"],
      required: true,
    },
    subjects: [subjectSchema],
    status: { type: Boolean, default: true }, // true = Active, false = Inactive
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
