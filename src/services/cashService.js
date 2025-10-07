import axios from "axios";

const API_URL = "http://localhost:4000/api/cash";

export const getBalance = async () => {
    try {
        const res = await axios.get(`${API_URL}/balance`);
        return res.data;
    } catch (error) {
        console.error("Error fetching balance: ", error);
        throw error;
    }
};

export const getFlows = async () => {
    try {
        const res = await axios.get(`${API_URL}/flow`);
        return res.data;
    } catch (error) {
        console.error("Error fetching flows: ", error);
        throw error;
    }
};

export const createFlow = async (flowData) => {
    try {
        const res = await axios.post(`${API_URL}/flow`, flowData);
        return res.data;
    } catch (error) {
        console.error("Error creating flow: ", error);
        throw error;
    }
};