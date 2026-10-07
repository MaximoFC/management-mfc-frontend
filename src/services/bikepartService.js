import api from "./api";

export const fetchBikeparts = async (search = "", type = "") => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (type) params.append("type", type);

    const { data } = await api.get(`/bikeparts?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Error fetching bikeparts: ", err);
    throw err.response?.data || { message: "Error obteniendo repuestos" };
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

export const updateBikepartStock = async (id, payload) => {
  try {
    const { data } = await api.patch(`/bikeparts/${id}/stock`, payload);
    return data;
  } catch (err) {
    console.error(`Error updating stock for bikepart ${id}`, err);
    throw err.response?.data || { message: "Error actualizando stock" };
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

export const importBikePartPricesExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post(
      `/bikeparts/prices/import-excel`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return data;
  } catch (err) {
    console.error("Error importing excel prices: ", err);
    throw err.response?.data || { message: "Error importando excel" };
  }
};

// Búsqueda paginada en el servidor: { items, total, page, pages }
export const searchBikepartsPage = async ({ search = "", type = "", inStock = true, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get("/bikeparts", {
    params: { search: search || undefined, type: type || undefined, inStock: inStock ? 1 : undefined, page, limit },
  });
  return data;
};
