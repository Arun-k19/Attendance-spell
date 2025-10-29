import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Admin / Staff / HOD
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === "Admin" && username === "admin" && password === "admin123") {
        setToastMsg("Login Successful!");
        navigate("/dashboard-admin");
      } else if (role === "Staff" && username === "staff" && password === "staff123") {
        setToastMsg("Login Successful!");
        navigate("/dashboard-staff");
      } else if (role === "HOD" && username === "hod" && password === "hod123") {
        setToastMsg("Login Successful!");
        navigate("/dashboard-hod");
      } else {
        setToastMsg("Invalid credentials!");
      }

      setTimeout(() => setToastMsg(""), 3000);
    }, 1500);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        height: "100vh",
        width: "100%",
        backgroundImage: "url('/chenduran.png')", // College image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1,
        }}
      ></div>

      <div
        className="card shadow-lg"
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "2rem",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          position: "relative",
          zIndex: 2,
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-4">
          <img
            src="/chenduran.png"
            alt="Logo"
            style={{ width: "80px", marginBottom: "10px" }}
          />
          <h3 className="fw-bold text-white">College Attendance</h3>
          <p className="text-light">Login to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role Selection */}
          <div className="mb-3">
            <select
              className="form-select form-select-lg"
              style={{ width: "100%" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>HOD</option>
            </select>
          </div>

          {/* Username */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              background: "linear-gradient(to right, #4e54c8, #8f94fb)",
              color: "#fff",
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Toast */}
        {toastMsg && (
          <div
            className="toast show position-absolute"
            style={{
              bottom: "-50px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: toastMsg.includes("Invalid") ? "#dc3545" : "#28a745",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              zIndex: 3,
            }}
          >
            {toastMsg}
          </div>
        )}

        <div className="text-center mt-3">
          <small style={{ color: "#fff" }}>
            Demo Accounts: <br />
            Admin → admin/admin123 <br />
            Staff → staff/staff123 <br />
            HOD → hod/hod123
          </small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
