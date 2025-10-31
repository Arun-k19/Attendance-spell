import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.log("❌ DB Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Register Route (for creating demo users)
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.json({ msg: "✅ User registered successfully!" });
  } catch (err) {
    console.log("❌ Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Login Route
app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("🟢 Incoming login:", { username, role });

  try {
    const user = await User.findOne({ username, role });
    if (!user) {
      console.log("🔴 User not found");
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("🔴 Password mismatch");
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    console.log("✅ Login successful");
    res.json({ msg: "Login Successful", user });
  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ msg: "DB Error" });
  }
});

// 🆕 ✅ Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // remove password field
    res.json(users);
  } catch (err) {
    console.log("❌ Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🆕 ✅ Get Users by Role (Admin / Staff / HOD)
app.get("/api/users/:role", async (req, res) => {
  const { role } = req.params;

  try {
    const users = await User.find({ role }).select("-password");
    if (users.length === 0) {
      return res.status(404).json({ msg: `No users found with role: ${role}` });
    }
    res.json(users);
  } catch (err) {
    console.log("❌ Error fetching role users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Attendance Backend Server is Running with MongoDB Atlas...");
});

// ✅ Start server
app.listen(process.env.PORT || 3001, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3001}`);
});
