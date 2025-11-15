import axios from "axios";
import BASE_URL from "../config";

export const saveAttendance = (data) =>
  axios.post(`${BASE_URL}/attendance/save`, data);

export const getAttendance = (params) =>
  axios.get(`${BASE_URL}/attendance/view`, { params });

export const getReport = (params) =>
  axios.get(`${BASE_URL}/attendance/report`, { params });
