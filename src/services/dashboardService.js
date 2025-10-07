import { getBalance } from "./cashService";
import { fetchBudgets } from "./budgetService";
import { fetchClients } from "./clientService";
import { fetchBikeparts } from "./bikepartService";
import { fetchNotifications } from "./notificationService";

export const fetchDashboardData = async () => {
    try {
        const [cashRes, budgetRes, clientsRes, bikepartsRes, notificationsRes] = await Promise.all([
            getBalance(),
            fetchBudgets(),
            fetchClients(),
            fetchBikeparts(),
            fetchNotifications()
        ]);

        const cash = cashRes?.balance || 0;
        const budgets = budgetRes || [];
        const clients = clientsRes || [];
        const parts = bikepartsRes || [];
        const notifications = notificationsRes || [];

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const trabajosPendientes = budgets.filter(b => b.state?.toLowerCase().includes("iniciado")).length;
        const pendientesRetiro = budgets.filter(b => b.state?.toLowerCase().includes("terminado"));
        const trabajosRecientes = [...budgets]
            .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
            .slice(0, 3);

        const totalClients = clients.length;
        const newClients = clients.filter(c => new Date(c.createdAt) >= lastMonth).length;

        const lowStock = parts.filter(p => p.stock <= 5);

        const recentNotifications = [...notifications]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        return {
            currentCash: cash,
            trabajosPendientes,
            pendientesRetiro,
            trabajosRecientes,
            totalClients,
            newClients,
            lowStock: lowStock.length,
            notifications: recentNotifications
        };
    } catch (error) {
        console.error("Error cargando dashboard: ", error);
        throw error;
    }
};