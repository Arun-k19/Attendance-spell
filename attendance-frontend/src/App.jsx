// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import LoginPage from "./users/LoginPage";
import AdminDashboard from "./users/AdminDashboard";
import HodDashboard from "./users/hodDashboard";// ✅ fixed casing (file + component name should match exactly)
import StaffDashboard from "./users/StaffDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
       <Route path="/dashboard-admin" element={<AdminDashboard />} />       
        <Route path="/dashboard-hod" element={<HodDashboard />} /> {/* ✅ fixed */}
         <Route path="/dashboard-staff" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
