import api from "./api";

export const fetchDollarRate = async () => {
    const res = await api.get('/utils/dollar-blue');
    return res.data.value;
};