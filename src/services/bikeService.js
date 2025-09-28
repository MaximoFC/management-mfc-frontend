import axios from "axios";

const API_URL = "http://localhost:4000/api/bikes";

export const fetchBikesByClient = async (clientId) => {
  try {
    const { data } = await axios.get(`${API_URL}?client_id=${clientId}`);
    return data;
  } catch (error) {
    console.error("Error fetching bikes: ", error);
    throw error.response?.data || { message: "Error al obtener bicicletas" };
  }
};

export async function addBike(bikeData) {
  try {
    const { data } = await axios.post(API_URL, bikeData, {
      headers: { "Content-Type": "application/json" }
    });
    return data;
  } catch (error) {
    console.error("Error adding bike: ", error);
    throw error.response?.data || { message: "Error al agregar bicicleta" };
  }
}