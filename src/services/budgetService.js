import api from "./api";

export const createBudget = async (data) => {
  try {
    const res = await api.post("/budgets", data);
    return res.data;
  } catch (error) {
    console.error("Error creating budget: ", error);
    throw error.response?.data || { message: "Error al crear presupuesto" };
  }
};

export const fetchBudgets = async () => {
  try {
    const { data } = await api.get("/budgets");
    return data;
  } catch (error) {
    console.error("Error fetching budgets: ", error);
    throw error.response?.data || { message: "Error al obtener presupuestos" };
  }
};

export const fetchBudgetById = async (budgetId) => {
  try {
    const { data } = await api.get(`/budgets/${budgetId}`);
    return data;
  } catch (error) {
    console.error("Error fetching budget by id: ", error);
    throw error.response?.data || { message: "Error al obtener presupuesto por ID" };
  }
};

export const updateBudgetState = async (budgetId, body) => {
  try {
    const { data } = await api.put(`/budgets/${budgetId}`, body);
    return data;
  } catch (error) {
    console.error("Error updating budget: ", error);
    throw error.response?.data || { message: "Error al actualizar estado de presupuesto" };
  }
};

export const fetchBudgetsByClient = async (clientId) => {
  try {
    const { data } = await api.get(`/budgets/client/${clientId}`);
    return data.budgets;
  } catch (error) {
    console.error("Error fetching budgets by client: ", error);
    throw error.response?.data || { message: "Error al obtener presupuestos del cliente" };
  }
};

export const getActiveWarranties = async (clientId, bikeId) => {
  try {
    const { data } = await api.get(
      `/budgets/active-warranties?client_id=${clientId}&bike_id=${bikeId}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching active warranties: ", error);
    throw error.response?.data || { message: "Error al obtener garantías activas" };
  }
};

export const generateBudgetPdf = async (budgetData) => {
  try {
    const response = await api.post("/budgets/generate-pdf", budgetData, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw new Error("Error generando PDF");
  }
};

export const updateBudgetItems = async (budgetId, itemsData) => {
  try {
    const { data } = await api.put(`/budgets/${budgetId}/items`, itemsData);
    return data;
  } catch (error) {
    console.error("Error updating budget items: ", error);
    throw error.response?.data || { message: "Error al actualizar ítems del presupuesto" };
  }
};