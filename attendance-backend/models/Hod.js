import mongoose from "mongoose";

const hodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, default: "HOD" },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Hod = mongoose.model("Hod", hodSchema);
export default Hod;
