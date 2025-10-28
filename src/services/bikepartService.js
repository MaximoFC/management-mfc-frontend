import api from "./api";

export const fetchBikeparts = async () => {
  try {
    const { data } = await api.get("/bikeparts");
    return data;
  } catch (err) {
    console.error("Error fetching bikeparts: ", err);
    throw err.response?.data || { message: "Error obteniendo repuestos" };
  }
};

export const searchBikeParts = async (q) => {
  try {
    const { data } = await api.get(`/bikeparts/search?q=${encodeURIComponent(q)}`);
    return data;
  } catch (err) {
    console.error("Error searching bikeparts: ", err);
    throw err.response?.data || { message: "Error buscando repuestos" };
  }
};

export const getBikepartById = async (id) => {
  try {
    const { data } = await api.get(`/bikeparts/${id}`);
    return data;
  } catch (err) {
    console.error(`Error fetching bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error obteniendo repuesto" };
  }
};

export const createBikepart = async (bikepart) => {
  try {
    const { data } = await api.post(`/bikeparts`, bikepart);
    return data;
  } catch (err) {
    console.error("Error creating bikepart: ", err);
    throw err.response?.data || { message: "Error al crear repuesto" };
  }
};

export const updateBikepart = async (id, bikepart) => {
  try {
    const { data } = await api.put(`/bikeparts/${id}`, bikepart);
    return data;
  } catch (err) {
    console.error(`Error updating bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error actualizando repuesto" };
  }
};

export const deleteBikepart = async (id) => {
  try {
    await api.delete(`/bikeparts/${id}`);
  } catch (err) {
    console.error(`Error deleting bikepart with id ${id}`, err);
    throw err.response?.data || { message: "Error eliminando repuesto" };

  }
};