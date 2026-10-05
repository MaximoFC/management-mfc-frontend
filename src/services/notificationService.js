import api from "./api";

export const fetchNotifications = async (params = {}) => {
    try {
        const { data } = await api.get("/notifications", { params });
        return data;
    } catch (error) {
        console.error("Error fetching notifications: ", error);
        throw error.response?.data || { message: "Error al obtener notificaciones" };
    }
};

export const markNotificationAsSeen = async (id) => {
    try {
        const { data } = await api.put(`/notifications/${id}/seen`);
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
