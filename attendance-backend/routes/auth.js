import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const router = express.Router();

// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Register Route (create users)
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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

// ✅ Get All Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.log("❌ Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get Users by Role
router.get("/users/:role", async (req, res) => {
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

export default router;
