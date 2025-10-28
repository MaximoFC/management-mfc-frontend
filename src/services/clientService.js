import api from "./api";

export async function fetchClients(query = '') {
  try {
    const url = query ? `/clients?q=${encodeURIComponent(query)}` : "/clients";
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching clients: ", error);
    throw error.response?.data || { message: "Error al obtener clientes" };
  }
}

export async function updateClient(id, payload) {
  try {
    const { data } = await api.put(`/clients/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error.response?.data || { message: "Error al actualizar cliente" };
  }
}

export async function addClient(data) {
  try {
    const { data: newClient } = await api.post("/clients", data, {
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
    const { data } = await api.get(`/clients/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching client by id: ", error);
    throw error.response?.data || { message: "Error al obtener cliente" };
  }
}
