import mongoose from "mongoose";

const hodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: Boolean, default: true }
});

// Prevent OverwriteModelError
const Hod = mongoose.models.Hod || mongoose.model("Hod", hodSchema);

export default Hod;
