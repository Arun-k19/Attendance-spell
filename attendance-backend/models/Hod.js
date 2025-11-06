import mongoose from "mongoose";

const hodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dept: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

// ✅ Prevent OverwriteModelError during nodemon restarts
const Hod = mongoose.models.Hod || mongoose.model("Hod", hodSchema);

export default Hod;
