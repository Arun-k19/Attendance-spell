import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());


// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ajay@2003",
  database: "apidb",
});

db.connect((err) => {
  if (err) console.log("❌ DB Error:", err);
  else console.log("✅ Connected to MySQL");
});

// Login route
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;

  const sql = "SELECT * FROM users WHERE username=? AND password=? AND role=?";
  db.query(sql, [username, password, role], (err, result) => {
    if (err) return res.status(500).json({ msg: "DB Error" });
    if (result.length > 0)
      return res.json({ msg: "Login Successful", user: result[0] });
    else return res.status(401).json({ msg: "Invalid credentials" });
  });
});

app.get("/", (req, res) => {
  res.send("✅ Attendance Backend Server is Running...");
});

app.get("/api/login", (req, res) => {
  const { username, password, role } = req.query;

  const sql = "SELECT * FROM users WHERE username=? AND password=? AND role=?";
  db.query(sql, [username, password, role], (err, result) => {
    if (err) return res.status(500).json({ msg: "DB Error" });
    if (result.length > 0)
      return res.json({ msg: "Login Successful", user: result[0] });
    else return res.status(401).json({ msg: "Invalid credentials" });
  });
});

app.listen(3001, () => console.log("🚀 Server running on http://localhost:3001"));
