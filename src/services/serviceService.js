import api from "./api";

export const fetchServices = async (query = "") => {
  try {
    const { data } = await api.get("/services", {
      params: query.length >= 2 ? { q: query  } : {}
    });
    return data;
  } catch (error) {
    console.error("Error fetching services: ", error);
    throw new Error("No se pudieron cargar los servicios");
  }
};

export const createService = async (serviceData) => {
  try {
    const { name, description, price_ars } = serviceData;

    if (!name || !description || !(price_ars > 0)) {
      throw new Error("Datos inválidos: revisá los campos");
    }

    const { data } = await api.post("/services", serviceData);
    return data;
  } catch (error) {
    console.error("Error creating service: ", error);
    throw new Error(error.response?.data.error || "Error al crear servicio");
  }
};

// Búsqueda paginada en el servidor: { items, total, page, pages }
export const searchServices = async ({ q = "", page = 1, limit = 10 } = {}) => {
  const { data } = await api.get("/services", { params: { q: q || undefined, page, limit } });
  return data;
};

export const deleteService = async (id) => {
  try {
    await api.delete(`/services/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al eliminar servicio");
  }
};

export const updateService = async (id, serviceData) => {
  try {
    const { data } = await api.put(`/services/${id}`, serviceData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al actualizar servicio");
  }
};
