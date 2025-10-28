import axios from "axios";
import api from "./api";

export async function fetchClients(query = '') {
  try {
    const url = query ? `${api}?q=${encodeURIComponent(query)}` : api;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching clients: ", error);
    throw error.response?.data || { message: "Error al obtener clientes" };
  }
}

export async function updateClient(id, payload) {
  try {
    const { data } = await axios.put(`${api}/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error.response?.data || { message: "Error al actualizar cliente" };
  }
}

export async function addClient(data) {
  try {
    const { data: newClient } = await axios.post(api, data, {
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
    const { data } = await axios.get(`${api}/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching client by id: ", error);
    throw error.response?.data || { message: "Error al obtener cliente" };
  }
}
