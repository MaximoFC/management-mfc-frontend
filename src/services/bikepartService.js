import axios from "axios";
import api from "./api";

export const fetchBikeparts = async () => {
  try {
    const { data } = await axios.get(api);
    return data;
  } catch (err) {
    console.error("Error fetching bikeparts: ", err);
    throw err.response?.data || { message: "Error obteniendo repuestos" };
  }
};

export const searchBikeParts = async (q) => {
  try {
    const { data } = await axios.get(`${api}/search?q=${encodeURIComponent(q)}`);
    return data;
  } catch (err) {
    console.error("Error searching bikeparts: ", err);
    throw err.response?.data || { message: "Error buscando repuestos" };
  }
};

export const getBikepartById = async (id) => {
  try {
    const { data } = await axios.get(`${api}/${id}`);
    return data;
  } catch (err) {
    console.error(`Error fetching bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error obteniendo repuesto" };
  }
};

export const createBikepart = async (bikepart) => {
  try {
    const { data } = await axios.post(`${api}`, bikepart);
    return data;
  } catch (err) {
    console.error("Error creating bikepart: ", err);
    throw err.response?.data || { message: "Error al crear repuesto" };
  }
};

export const updateBikepart = async (id, bikepart) => {
  try {
    const { data } = await axios.put(`${api}/${id}`, bikepart);
    return data;
  } catch (err) {
    console.error(`Error updating bikepart with id ${id}: `, err);
    throw err.response?.data || { message: "Error actualizando repuesto" };
  }
};

export const deleteBikepart = async (id) => {
  try {
    await axios.delete(`${api}/${id}`);
  } catch (err) {
    console.error(`Error deleting bikepart with id ${id}`, err);
    throw err.response?.data || { message: "Error eliminando repuesto" };

  }
};