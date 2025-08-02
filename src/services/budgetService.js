import axios from "axios";
const API_URL = "http://localhost:4000/api/budgets";

export const createBudget = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const fetchBudgets = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const updateBudgetState = async (budgetId, body) => {
  const { data } = await axios.put(`${API_URL}/${budgetId}`, body);
  return data;
};