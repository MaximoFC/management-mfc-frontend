import axios from "axios";
const API_URL = "http://localhost:4000/api/services";

export const fetchServices = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const createService = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};