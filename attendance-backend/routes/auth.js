import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const router = express.Router();

// ✅ Define Schema (with lowercase index for consistency)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// ✅ Prevent model overwrite error during hot reload
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 🔍 Case-insensitive check for existing user
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
    });

    await newUser.save();
    console.log(`✅ Registered new user: ${username} (${role})`);

    res.json({ msg: "✅ User registered successfully!" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Login Route (case-insensitive)
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("🟢 Incoming login:", { username, role });

  try {
    // 🔍 Case-insensitive username & role match
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });

    if (!user) {
      console.log("🔴 User not found");
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("🔴 Password mismatch");
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    console.log(`✅ Login successful for ${username} (${user.role})`);
    res.json({ msg: "Login Successful", user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "DB Error" });
  }
});

// ✅ Get All Users (excluding passwords)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get Users by Role
router.get("/users/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({
      role: { $regex: new RegExp(`^${role}$`, "i") },
    }).select("-password");

    if (users.length === 0) {
      return res.status(404).json({ msg: `No users found with role: ${role}` });
    }

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching role users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
