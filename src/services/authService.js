import api from "./api";

export const loginEmployee = async (name, password) => {
    try {
        const res = await api.post("/login", {
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
    try {
        const res = await api.get("/profile");
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error verifying session');
    }   
};
