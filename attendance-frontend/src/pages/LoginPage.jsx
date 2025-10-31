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
      const res = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
        role,
      });

      setLoading(false);
      setToastMsg(res.data.msg);

      if (res.data.msg === "Login Successful") {
        if (role === "Admin") navigate("/dashboard-admin");
        else if (role === "Staff") navigate("/dashboard-staff");
        else if (role === "HOD") navigate("/dashboard-hod");
      }
    } catch (err) {
      setLoading(false);
      setToastMsg("Invalid credentials!");
    }

    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/chenduran.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      ></div>

      <div
        className="card shadow-lg"
        style={{
          width: "40%",
          minWidth: "400px",
          maxWidth: "600px",
          padding: "3rem",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(15px)",
          borderRadius: "25px",
          border: "1px solid rgba(255,255,255,0.3)",
          position: "relative",
          zIndex: 2,
          transform: "scale(1.05)",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <div className="text-center mb-4">
          <img
            src="/chenduran.png"
            alt="Logo"
            style={{
              width: "100px",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          />
          <h2 className="fw-bold text-white">College Attendance</h2>
          <p className="text-light">Login to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <select
              className="form-select form-select-lg"
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
                right: "15px",
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

          <button
            type="submit"
            className="btn w-100 fw-bold py-2"
            style={{
              background: "linear-gradient(to right, #4e54c8, #8f94fb)",
              color: "#fff",
              fontSize: "18px",
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {toastMsg && (
          <div
            className="toast show position-absolute"
            style={{
              bottom: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: toastMsg.includes("Invalid")
                ? "#dc3545"
                : "#28a745",
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
            Admin → admin / admin123 <br />
            Staff → staff / staff123 <br />
            HOD → hod / hod123
          </small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
