import axios from "axios";
import api from "./api";

export const getBalance = async () => {
    try {
        const res = await axios.get(`${api}/balance`);
        return res.data;
    } catch (error) {
        console.error("Error fetching balance: ", error);
        throw error;
    }
};

export const getFlows = async () => {
    try {
        const res = await axios.get(`${api}/flow`);
        return res.data;
    } catch (error) {
        console.error("Error fetching flows: ", error);
        throw error;
    }
};

export const createFlow = async (flowData) => {
    try {
        const res = await axios.post(`${api}/flow`, flowData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return res.data;
    } catch (error) {
        console.error("Error creating flow: ", error);
        throw error;
    }
};