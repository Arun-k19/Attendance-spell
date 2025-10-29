// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import HodDashboard from "./pages/hodDashboard";// ✅ fixed casing (file + component name should match exactly)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/dashboard-staff" element={<StaffDashboard />} />
        <Route path="/dashboard-hod" element={<HodDashboard />} /> {/* ✅ fixed */}
      </Routes>
    </Router>
  );
}

export default App;
