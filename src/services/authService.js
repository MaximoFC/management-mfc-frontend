import api from "./api";

export const loginEmployee = async (email, password) => {
    try {
        const res = await api.post("/auth/login", {
            email,
            password
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Login error');
    }
};

export const getProfile = async () => {
    try {
        const res = await api.get("/auth/profile");
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error verifying session');
    }   
};

export const registerWithToken = async ({ token, name, password }) => {
    try {
        const res = await api.post("/auth/register", {
            token,
            name,
            password
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Register error');
    }
};

export const forgotPassword = async (email) => {
    try {
        const res = await api.post("/auth/forgot-password", { email });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error');
    }
};

export const resetPassword = async ({ token, password }) => {
    try {
        const res = await api.post("/auth/reset-password", {
            token,
            password
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error');
    }
};

export const createInvitation = async (email) => {
    try {
        const res = await api.post("/invitations/invite", { email });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error sending invitation");
    }
};
