import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ✅ Import routes
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Routes
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Attendance Backend Server is Running with MongoDB Atlas...");
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
