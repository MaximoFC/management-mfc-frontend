import axios from "axios";
import api from "./api";

export const fetchNotifications = async () => {
    try {
        const { data } = await axios.get(api);
        return data;
    } catch (error) {
        console.error("Error fetching notifications: ", error);
        throw error.response?.data || { message: "Error al obtener notificaciones" };
    }
};

export const fetchNotificationById = async (id) => {
    try {
        const { data } = await axios.get(`${api}/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching notification by id: ", error);
        throw error.response?.data || { message: "Error al obtener notificación por id" };
    }
};

export const createNotification = async (notification) => {
    try {
        const { data } = await axios.post(api, notification);
        return data;
    } catch (error) {
        console.error("Error creating notification: ", error);
        throw error.response?.data || { message: "Error al crear notificación" };
    }
};

export const markNotificationAsSeen = async (id) => {
    try {
        const { data } = await axios.put(`${api}/${id}/seen`);
        return data;
    } catch (error) {
        console.error("Error marking notification as seen: ", error);
        throw error.response?.data || { message: "Error al marcar la notificación como vista" };
    }
};

export const deleteNotification = async (id) => {
    try {
        const { data } = await axios.delete(`${api}/${id}`);
        return data;
    } catch (error) {
        console.error("Error deleting notification: ", error);
        throw error.response?.data || { message: "Error al eliminar notificación" };
    }
};