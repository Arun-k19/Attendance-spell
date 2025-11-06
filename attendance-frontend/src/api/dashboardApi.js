import axios from "axios";
import BASE_URL from "../config";

export const getDashboardCounts = async () => {
  return await axios.get(`${BASE_URL}/dashboard/counts`);
};
