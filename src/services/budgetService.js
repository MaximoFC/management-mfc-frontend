import axios from "axios";

const API_URL = "http://localhost:4000/api/budgets";

export const createBudget = async (data) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (error) {
    console.error("Error creating budget: ", error);
    throw error.response?.data || { message: "Error al crear presupuesto" };
  }
};

export const fetchBudgets = async () => {
  try {
    const { data } = await axios.get(API_URL);
    return data;
  } catch (error) {
    console.error("Error fetching budgets: ", error);
    throw error.response?.data || { message: "Error al obtener presupuestos" };
  }
};

export const fetchBudgetById = async (budgetId) => {
  try {
    const { data } = await axios.get(`${API_URL}/${budgetId}`);
    return data;
  } catch (error) {
    console.error("Error fetching budget by id: ", error);
    throw error.response?.data || { message: "Error al obtener presupuesto por ID" };
  }
};

export const updateBudgetState = async (budgetId, body) => {
  try {
    const { data } = await axios.put(`${API_URL}/${budgetId}`, body);
    return data;
  } catch (error) {
    console.error("Error updating budget: ", error);
    throw error.response?.data || { message: "Error al actualizar estado de presupuesto" };
  }
};

export const fetchBudgetsByClient = async (clientId) => {
  try {
    const { data } = await axios.get(`${API_URL}/client/${clientId}`);
    return data.budgets;
  } catch (error) {
    console.error("Error fetching budgets by client: ", error);
    throw error.response?.data || { message: "Error al obtener presupuestos del cliente" };
  }
};

export const getActiveWarranties = async (clientId, bikeId) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/active-warranties?client_id=${clientId}&bike_id=${bikeId}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching active warranties: ", error);
    throw error.response?.data || { message: "Error al obtener garantías activas" };
  }
};

export const generateBudgetPdf = async (budgetData) => {
  const response = await fetch("http://localhost:4000/api/budgets/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budgetData),
  });

  if (!response.ok) throw new Error("Error generando PDF");

  const blob = await response.blob();
  return blob;
};