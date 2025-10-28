import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:4000/api";

const api = axios.create({
    baseUrl: BASE_URL,
    timeout: 10000
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error: ", error);
        throw error.response?.data || { message: "Error en el servidor" };
    }
);

export default api;