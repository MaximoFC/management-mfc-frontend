import api from "./api";

export const fetchBikesByClient = async (clientId) => {
  try {
    const { data } = await api.get(`/bikes?client_id=${clientId}`);
    return data;
  } catch (error) {
    console.error("Error fetching bikes: ", error);
    throw error.response?.data || { message: "Error al obtener bicicletas" };
  }
};

export async function addBike(bikeData) {
  try {
    const { data } = await api.post("/bikes", bikeData, {
      headers: { "Content-Type": "application/json" }
    });
    return data;
  } catch (error) {
    console.error("Error adding bike: ", error);
    throw error.response?.data || { message: "Error al agregar bicicleta" };
  }
}