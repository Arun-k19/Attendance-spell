import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const router = express.Router();

// ✅ Schema (🔥 department added)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String } // ✅ NEW FIELD
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, department } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      role: role.trim(),
      department: department ? department.toUpperCase() : "" // ✅ SAVE
    });

    await newUser.save();

    res.json({ msg: "User registered successfully" });

  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    console.log("✅ Login success:", user.username, user.department);

    // ✅ SEND department from DB (NO HACK)
    res.json({
      msg: "Login Successful",
      user: {
        username: user.username,
        role: user.role,
        department: user.department || "" // 🔥
      }
    });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "DB Error" });
  }
});

// ================= GET USERS =================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET USERS BY ROLE =================
router.get("/users/:role", async (req, res) => {
  try {
    const { role } = req.params;

    const users = await User.find({
      role: { $regex: new RegExp(`^${role}$`, "i") },
    }).select("-password");

    if (users.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    res.json(users);

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;