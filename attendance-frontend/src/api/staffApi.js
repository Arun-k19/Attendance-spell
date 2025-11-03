import axios from "axios";

const API_URL = "http://localhost:3001/api/staff"; // backend URL

export const getAllStaff = () => axios.get(API_URL);
export const addStaff = (staffData) => axios.post(`${API_URL}/add`, staffData);
export const updateStaff = (id, staffData) => axios.put(`${API_URL}/${id}`, staffData);
export const deleteStaff = (id) => axios.delete(`${API_URL}/${id}`);
