import axios from "axios";
import BASE_URL from "../config";

export const getStudentsByFilter = async (dept, year) => {
  return axios.get(`${BASE_URL}/students`, {
    params: { dept, year }
  });
};
