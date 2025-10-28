import api from "./api";

export const fetchNotifications = async () => {
    try {
        const { data } = await api.get("/notifications");
        return data;
    } catch (error) {
        console.error("Error fetching notifications: ", error);
        throw error.response?.data || { message: "Error al obtener notificaciones" };
    }
};

export const fetchNotificationById = async (id) => {
    try {
        const { data } = await api.get(`/notifications/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching notification by id: ", error);
        throw error.response?.data || { message: "Error al obtener notificación por id" };
    }
};

export const createNotification = async (notification) => {
    try {
        const { data } = await api.post("notifications", notification);
        return data;
    } catch (error) {
        console.error("Error creating notification: ", error);
        throw error.response?.data || { message: "Error al crear notificación" };
    }
};

export const markNotificationAsSeen = async (id) => {
    try {
        const { data } = await api.put(`/notifications"/${id}/seen`);
        return data;
    } catch (error) {
        console.error("Error marking notification as seen: ", error);
        throw error.response?.data || { message: "Error al marcar la notificación como vista" };
    }
};

export const deleteNotification = async (id) => {
    try {
        const { data } = await api.delete(`/notifications/${id}`);
        return data;
    } catch (error) {
        console.error("Error deleting notification: ", error);
        throw error.response?.data || { message: "Error al eliminar notificación" };
    }
};