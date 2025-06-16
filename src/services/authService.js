import axios from "axios";

const API_URL = 'http://localhost:4000/api';

export const loginEmployee = async (name, password) => {
    try {
        const res = await axios.post(`${API_URL}/login`, {
            name,
            password
        });
        return res.data
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Login error');
    }
};