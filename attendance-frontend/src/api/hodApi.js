import axios from "axios";

// Backend URL — same structure as staff
const API_URL = "http://localhost:3001/api/hod";

// 🔹 Get all HODs
export const getAllHods = () => axios.get(API_URL);

// 🔹 Add new HOD
export const addHod = (hodData) => axios.post(`${API_URL}/add`, hodData);

// 🔹 Update HOD
export const updateHod = (id, hodData) => axios.put(`${API_URL}/${id}`, hodData);

// 🔹 Delete HOD
export const deleteHod = (id) => axios.delete(`${API_URL}/${id}`);
