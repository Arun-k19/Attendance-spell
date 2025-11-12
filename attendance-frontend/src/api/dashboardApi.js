import axios from "axios";
import BASE_URL from "../config";

// 🧩 Admin Dashboard Counts
export const getDashboardCounts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/admin/dashboard-counts`);
    return res; // { data: { totalStudents, totalStaffs, totalHods, attendancePercent } }
  } catch (err) {
    console.error("❌ Error fetching Admin dashboard counts:", err);
    throw err;
  }
};

// 🧩 HOD Dashboard Counts
export const getHODDashboardCounts = async (department) => {
  try {
    const res = await axios.get(`${BASE_URL}/hod/dashboard-counts/${department}`);
    return res; // { data: { totalStudents, totalStaffs, attendancePercent } }
  } catch (err) {
    console.error("❌ Error fetching HOD dashboard counts:", err);
    throw err;
  }
};
