import api from "./api";

export const fetchServices = async () => {
  try {
    const { data } = await api.get("/services");
    return data;
  } catch (error) {
    console.error("Error fetching services: ", error);
    throw new Error("No se pudieron cargar los servicios");
  }
};

export const fetchServiceById = async (id) => {
  try {
    const { data } = await api.get(`/services/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching service by id: ", error);
    throw new Error("No se pudo obtener el servicio especificado");
  }
};

export const createService = async (serviceData) => {
  try {
    const { name, description, price_usd } = serviceData;

    if (!name || !description || price_usd <= 0) {
      throw new Error("Datos inválidos: revisá los campos");
    }

    const { data } = await api.post("/services", serviceData);
    return data;
  } catch (error) {
    console.error("Error creating service: ", error);
    throw new Error(error.response?.data.error || "Error al crear servicio");
  }
};