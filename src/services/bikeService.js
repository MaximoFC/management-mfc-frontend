import axios from "axios";
import api from "./api";


export const fetchBikesByClient = async (clientId) => {
  try {
    const { data } = await axios.get(`${api}?client_id=${clientId}`);
    return data;
  } catch (error) {
    console.error("Error fetching bikes: ", error);
    throw error.response?.data || { message: "Error al obtener bicicletas" };
  }
};

export async function addBike(bikeData) {
  try {
    const { data } = await axios.post(api, bikeData, {
      headers: { "Content-Type": "application/json" }
    });
    return data;
  } catch (error) {
    console.error("Error adding bike: ", error);
    throw error.response?.data || { message: "Error al agregar bicicleta" };
  }
}