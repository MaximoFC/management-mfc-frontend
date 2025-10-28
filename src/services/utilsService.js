import axios from "axios";
import api from "./api";

export const fetchDollarRate = async () => {
    const res = await axios.get(`${api}/utils/dollar-blue'`);
    return res.data.value;
};