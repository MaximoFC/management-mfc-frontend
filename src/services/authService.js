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

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getCurrentEmployee = () => {
    const employee = localStorage.getItem('employee');
    return employee ? JSON.parse(employee) : null
};

export const getProfile = async () => {
    const token = localStorage.getItem('token');

    try {
        const res = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error verifying session');
    }   
};
