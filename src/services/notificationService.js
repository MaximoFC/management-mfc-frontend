import axios from "axios";

const API_URL = "http://localhost:4000/api/notifications";

export const fetchNotifications = async () => {
    try {
        const { data } = await axios.get(API_URL);
        return data;
    } catch (error) {
        console.error("Error fetching notifications: ", error);
        throw error.response?.data || { message: "Error al obtener notificaciones" };
    }
};

export const fetchNotificationById = async (id) => {
    try {
        const { data } = await axios.get(`${API_URL}/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching notification by id: ", error);
        throw error.response?.data || { message: "Error al obtener notificación por id" };
    }
};

export const createNotification = async (notification) => {
    try {
        const { data } = await axios.post(API_URL, notification);
        return data;
    } catch (error) {
        console.error("Error creating notification: ", error);
        throw error.response?.data || { message: "Error al crear notificación" };
    }
};

export const markNotificationAsSeen = async (id) => {
    try {
        const { data } = await axios.put(`${API_URL}/${id}/seen`);
        return data;
    } catch (error) {
        console.error("Error marking notification as seen: ", error);
        throw error.response?.data || { message: "Error al marcar la notificación como vista" };
    }
};

export const deleteNotification = async (id) => {
    try {
        const { data } = await axios.delete(`${API_URL}/${id}`);
        return data;
    } catch (error) {
        console.error("Error deleting notification: ", error);
        throw error.response?.data || { message: "Error al eliminar notificación" };
    }
};