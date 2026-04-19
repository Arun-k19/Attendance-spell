import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


// ✅ Import routes
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/studentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: [
    "https://attendance-spell.vercel.app",
    "http://localhost:5174"
  ],
  credentials: true
}));~
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Attendance Backend Server is Running with MongoDB Atlas...");
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
