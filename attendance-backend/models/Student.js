import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dept: { type: String, required: true },
  year: { type: String, required: true },
  attendance: { type: String, default: 0 }
});

export default mongoose.model("Student", studentSchema);
