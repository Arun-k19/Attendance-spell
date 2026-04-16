import axios from "axios";
import BASE_URL from "../config";

// 🧩 Admin Dashboard Counts
export const getDashboardCounts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/dashboard/admin-counts`);
    return res;
  } catch (err) {
    console.error("❌ Error fetching Admin dashboard counts:", err);
    throw err;
  }
};

// 🧩 HOD Dashboard Counts
export const getHODDashboardCounts = async (department) => {
  try {
    const res = await axios.get(`${BASE_URL}/hod/dashboard-counts/${department}`);
    return res;
  } catch (err) {
    console.error("❌ Error fetching HOD dashboard counts:", err);
    throw err;
  }
};

export const getDepartmentDetails = (dept) =>
  axios.get(`${BASE_URL}/dashboard/department-details/${dept}`);