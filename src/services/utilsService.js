import axios from "axios";

export const fetchDollarRate = async () => {
    const res = await axios.get('http://localhost:4000/api/utils/dollar-blue');
    return res.data.value;
};