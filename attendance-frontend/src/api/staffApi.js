import axios from "axios";

const API_URL = "https://attendance-spell-management.onrender.com/api/staff"; // backend URL

export const getAllStaff = () => axios.get(API_URL);
export const addStaff = (staffData) => axios.post(`${API_URL}/add`, staffData);
export const updateStaff = (id, staffData) => axios.put(`${API_URL}/${id}`, staffData);
export const deleteStaff = (id) => axios.delete(`${API_URL}/${id}`);
