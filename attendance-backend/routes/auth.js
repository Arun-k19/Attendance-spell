import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Hod from "../models/Hod.js";
import Staff from "../models/Staff.js"; // ✅ NEW IMPORT

const router = express.Router();

// ================= SCHEMA =================
const userSchema = new mongoose.Schema({
  username:   { type: String, required: true },
  password:   { type: String, required: true },
  role:       { type: String, required: true },
  department: { type: String }
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
      role:     { $regex: new RegExp(`^${role}$`,     "i") },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username:   username.trim(),
      password:   hashedPassword,
      role:       role.trim(),
      department: department ? department.toUpperCase() : ""
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
      role:     { $regex: new RegExp(`^${role}$`,     "i") },
    });

    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    let department = user.department || "";
    let subjects   = [];

    // 🔥 HOD — fetch department from Hod collection
    if (user.role.toUpperCase() === "HOD") {
      const hod = await Hod.findOne({
        username: { $regex: new RegExp(`^${user.username}$`, "i") }
      });
      if (hod) department = hod.department;
    }

    // ✅ STAFF / FACULTY — fetch subjects from Staff collection
    if (["FACULTY", "STAFF"].includes(user.role.toUpperCase())) {
      const staffRecord = await Staff.findOne({
        name: { $regex: new RegExp(`^${user.username}$`, "i") }
      });

      if (staffRecord) {
        department = staffRecord.department || department;
        // subjects = [{ name, year, department }]
        subjects = (staffRecord.subjects || []).map((s) => ({
          name:       s.name,
          year:       String(s.year),
          department: (s.department || staffRecord.department || "").toUpperCase(),
        }));
      }
    }

    console.log("✅ Login:", user.username, "| Dept:", department, "| Subjects:", subjects);

    res.json({
      msg: "Login Successful",
      user: {
        username:   user.username,
        role:       user.role,
        department: department,
        subjects:   subjects, // ✅ NOW INCLUDED FOR STAFF
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

    if (users.length === 0)
      return res.status(404).json({ msg: "No users found" });

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE USER =================
router.delete("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const deleted = await User.findOneAndDelete({
      username: { $regex: new RegExp(`^${username}$`, "i") }
    });

    if (!deleted) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

// ================= UPDATE USER =================
router.put("/users/:username", async (req, res) => {
  try {
    const { username }    = req.params;
    const { newUsername } = req.body;

    const updated = await User.findOneAndUpdate(
      { username: { $regex: new RegExp(`^${username}$`, "i") } },
      { username: newUsername.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User updated successfully", user: updated });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ msg: "Update failed" });
  }
});

export default router;