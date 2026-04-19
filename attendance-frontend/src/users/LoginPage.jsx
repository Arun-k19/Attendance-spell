import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import BASE_URL from "../config";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
} from "react-icons/fa";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
        role,
      });

      setLoading(false);
      setToastMsg(res.data.msg);

      if (res.data.msg === "Login Successful") {
        const userRole = res.data.user.role?.toLowerCase();

        localStorage.setItem(
          "user",
          JSON.stringify({
            username: res.data.user.username,
            role: res.data.user.role,
            department: res.data.user.department,
            subjects: res.data.user.subjects || [],
          })
        );

        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/dashboard-admin");
          } else if (userRole === "hod") {
            localStorage.setItem(
              "hodData",
              JSON.stringify({
                username: res.data.user.username,
                role: res.data.user.role,
                department: res.data.user.department,
              })
            );
            navigate("/dashboard-hod");
          } else if (userRole === "staff") {
            localStorage.setItem(
              "staffData",
              JSON.stringify({
                username: res.data.user.username,
                role: res.data.user.role,
                department: res.data.user.department,
                subjects: res.data.user.subjects || [],
              })
            );
            navigate("/dashboard-staff");
          }
        }, 1000);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLoading(false);
      setToastMsg("Invalid Username or Password!");
    }

    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        backgroundImage: "url('chenduran.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      />

      {/* Login Card */}
      <div
        className="card text-center p-5 position-relative shadow-lg"
        style={{
          width: "90%",
          maxWidth: "500px",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "25px",
          zIndex: 2,
          animation: "floatUp 0.8s ease",
        }}
      >
        <img
          src="/chendhuran-logo.png"
          alt="College Logo"
          className="mb-3 mx-auto d-block"
          style={{ width: "90px", borderRadius: "10px" }}
        />

        <h2 className="fw-bold text-white mb-2">College Attendance</h2>
        <p className="text-light mb-4">Login to continue</p>

        <form onSubmit={handleLogin}>
          {/* Role Dropdown */}
          <div className="mb-3 position-relative">
            <FaUserShield className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary" />
            <select
              className="form-select form-select-lg ps-5"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "12px" }}
            >
              <option value="">Select Role</option>
              <option value="admin">👑 Admin</option>
              <option value="hod">🎓 HOD</option>
              <option value="staff">👨‍🏫 Staff</option>
            </select>
          </div>

          {/* Username */}
          <div className="mb-3 position-relative">
            <FaUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            <input
              type="text"
              className="form-control form-control-lg ps-5"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "12px" }}
            />
          </div>

          {/* Password */}
          <div className="mb-4 position-relative">
            <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            <input
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg ps-5 pe-5"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "12px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute top-50 end-0 translate-middle-y me-3"
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Button */}
          <button
            className="btn btn-lg w-100 fw-bold text-white"
            style={{
              background: "linear-gradient(to right, #4e54c8, #8f94fb)",
              borderRadius: "12px",
              transition: "0.3s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ Copyright */}
        <p style={{
          marginTop: "24px",
          marginBottom: 0,
          fontSize: "12px",
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.3px",
        }}>
          © {new Date().getFullYear()} Chendhuran College of Engineering & Technology. Designed & Developed by Team 2026.
        </p>

        {/* Toast */}
        {toastMsg && (
          <div
            className="toast show position-absolute start-50 translate-middle-x mt-3"
            style={{
              background: toastMsg.includes("Invalid") ? "#dc3545" : "#28a745",
              padding: "10px 20px",
              borderRadius: "12px",
              color: "#fff",
              bottom: "-60px",
            }}
          >
            {toastMsg}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .form-control:focus,
        .form-select:focus {
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
          border-color: #6366f1;
          transition: 0.3s;
        }
        button:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default LoginPage;