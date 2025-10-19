import axios from "axios";

const API_URL = "http://localhost:4000/api/bikeparts";

export const fetchBikeparts = async () => {
  try {
    const { data } = await axios.get(API_URL);
    return data;
  } catch (err) {
    console.error("Error fetching bikeparts: ", err);
    throw err.response?.data || { message: "Error obteniendo repuestos" };
  }
};

export const searchBikeParts = async (q) => {
  try {
    const { data } = await axios.get(`${API_URL}/search?q=${encodeURIComponent(q)}`);
    return data;
  } catch (err) {
    console.error("Error searching bikeparts: ", err);
    throw err.response?.data || { message: "Error buscando repuestos" };
  }
};

export const getBikepartById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  } catch (err) {
    console.error(`Error fetching bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error obteniendo repuesto" };
  }
};

export const createBikepart = async (bikepart) => {
  try {
    const { data } = await axios.post(`${API_URL}`, bikepart);
    return data;
  } catch (err) {
    console.error("Error creating bikepart: ", err);
    throw err.response?.data || { message: "Error al crear repuesto" };
  }
};

export const updateBikepart = async (id, bikepart) => {
  try {
    const { data } = await axios.put(`${API_URL}/${id}`, bikepart);
    return data;
  } catch (err) {
    console.error(`Error updating bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error actualizando repuesto" };
  }
};

export const deleteBikepart = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (err) {
    console.error(`Error deleting bikepart with id ${id}`, err);
    throw err.response?.data || { message: "Error eliminando repuesto" };

  }
};