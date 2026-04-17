import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

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
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          username,
          password,
          role,
        }
      );
      console.log("LOGIN RESPONSE:", res.data);

      setLoading(false);
      setToastMsg(res.data.msg);

      if (res.data.msg === "Login Successful") {
        const userRole = res.data.user.role?.toLowerCase();

        // ✅ FIX: always save department properly
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: res.data.user.username,
            role: res.data.user.role,
            department: res.data.user.department,
          })
        );
        console.log("SAVED USER:", {
          username: res.data.user.username,
          role: res.data.user.role,
          department: res.data.user.department
        });

        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/dashboard-admin");
          }

          else if (userRole === "hod") {
            // ✅ NO username split
            localStorage.setItem(
              "hodData",
              JSON.stringify({
                username: res.data.user.username,
                role: res.data.user.role,
                department: res.data.user.department,
              })
            );

            navigate("/dashboard-hod");
          }

          else if (userRole === "staff") {
            // ✅ FIXED (no split hack)
            localStorage.setItem(
              "staffData",
              JSON.stringify({
                username: res.data.user.username,
                role: res.data.user.role,
                department: res.data.user.department,
              })
            );

            navigate("/dashboard-staff");
          }

        }, 1000);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLoading(false);
      setToastMsg("Invalid credentials!");
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
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      ></div>

      {/* Login Card */}
      <div
        className="card text-center p-5 position-relative"
        style={{
          width: "90%",
          maxWidth: "500px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
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
          style={{ width: "100px", borderRadius: "10px" }}
        />

        <h2 className="fw-bold text-white mb-2">College Attendance</h2>
        <p className="text-light mb-4">Login to continue</p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <select
              className="form-select form-select-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: "12px",
              }}
            >
              <option value="">Select Role</option>
              <option>Admin</option>
              <option>HOD</option>
              <option>Staff</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: "12px",
              }}
            />
          </div>

          <div className="mb-4 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: "12px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y fw-bold"
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                marginRight: "12px",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="btn btn-lg w-100 fw-bold text-white"
            style={{
              background: "linear-gradient(to right, #4e54c8, #8f94fb)",
              borderRadius: "12px",
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

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

      <style>
        {`
        @keyframes floatUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}
      </style>
    </div>
  );
}

export default LoginPage;