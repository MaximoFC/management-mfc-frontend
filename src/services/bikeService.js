import axios from "axios";
const API_URL = "http://localhost:4000/api/bikes";

export const fetchBikesByClient = async (clientId) => {
  const { data } = await axios.get(`${API_URL}?client_id=${clientId}`);
  return data;
};
