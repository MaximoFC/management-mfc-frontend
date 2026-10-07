import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    timeout: 50000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token vencido o inválido: cerrar sesión y volver al login
        if (error.response?.status === 401 && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            localStorage.removeItem("employee");
            localStorage.removeItem("budget-storage"); // borrador del presupuesto en armado
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
