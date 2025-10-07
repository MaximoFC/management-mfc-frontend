import axios from "axios";

const API_URL = 'http://localhost:4000/api/clients';

export async function fetchClients(query = '') {
  try {
    const url = query ? `${API_URL}?q=${encodeURIComponent(query)}` : API_URL;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching clients: ", error);
    throw error.response?.data || { message: "Error al obtener clientes" };
  }
}

export async function updateClient(id, payload) {
  try {
    const { data } = await axios.put(`${API_URL}/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error.response?.data || { message: "Error al actualizar cliente" };
  }
}

export async function addClient(data) {
  try {
    const { data: newClient } = await axios.post(API_URL, data, {
      headers: { "Content-Type": "application/json" }
    });
    return newClient;
  } catch (error) {
    console.error("Error adding client: ", error);
    throw error.response?.data || { message: "Error al agregar cliente" };
  }
}

export async function fetchClientById(id) {
  try {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching client by id: ", error);
    throw error.response?.data || { message: "Error al obtener cliente" };
  }
}
