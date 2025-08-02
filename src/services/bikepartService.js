import axios from "axios";
const API_URL = "http://localhost:4000/api/bikeparts";

export const fetchBikeparts = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};
