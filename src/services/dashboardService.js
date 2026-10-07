import api from "./api";
import { getBalance } from "./cashService";

export const fetchDashboardData = async ({ includeCash = false } = {}) => {
    const [summary, cashRes] = await Promise.all([
        api.get("/bootstrap/dashboard").then((res) => res.data),
        // sin caja el resto del dashboard igual carga
        includeCash ? getBalance().catch(() => null) : null,
    ]);
    return { ...summary, currentCash: cashRes?.balance || 0 };
};
