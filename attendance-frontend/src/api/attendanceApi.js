import axios from "axios";

export const saveAttendance = async (data) => {
  return await axios.post(`${BASE_URL}/attendance/save`, data);
};

export const getAttendance = async (params) => {
  return await axios.get(`${BASE_URL}/attendance/view`, { params });
};

export const getReport = async (params) => {
  return await axios.get(`${BASE_URL}/attendance/report`, { params });
};
