import { create } from "zustand";
import { fetchBikeparts } from "../services/bikepartService";
import { fetchClients } from "../services/clientService";

export const useInventoryStore = create((set, get) => ({
  bikeparts: [],
  clients: [],
  initialized: false,
  loadingBootstrap: false,

  fetchBootstrap: async () => {
    if (get().initialized) return;

    set({ loadingBootstrap: true });

    try {
      // Se carga solo en las pantallas que lo usan (clientes, inventario), no al iniciar sesión
      const [bikeparts, clients] = await Promise.all([
        fetchBikeparts(),
        fetchClients("", { withBikes: true }),
      ]);

      set({
        bikeparts,
        clients,
        initialized: true,
        loadingBootstrap: false,
      });
    } catch (err) {
      console.error("Inventory bootstrap error:", err);
      set({ loadingBootstrap: false });
    }
  },

  refreshBikeparts: async () => {
    if (!get().initialized) return; // se cargará fresco al entrar al inventario
    try {
      const bikeparts = await fetchBikeparts();
      set({ bikeparts });
    } catch (err) {
      console.error("Error refreshing bikeparts: ", err);
    }
  },

  addPart: (newPart) => {
    set((s) => ({
      bikeparts: [...s.bikeparts, newPart],
    }));
  },

  updatePart: (updated) => {
    set((s) => ({
      bikeparts: s.bikeparts.map((p) =>
        p._id === updated._id ? { ...p, ...updated } : p
      ),
    }));
  },

  removePart: (id) => {
    set((s) => ({
      bikeparts: s.bikeparts.filter((p) => p._id !== id),
    }));
  },

  setMultipleBikepartStocks: (items) => {
    set((s) => ({
      bikeparts: s.bikeparts.map((p) => {
        const found = items.find((i) => i.id === p._id);
        return found ? { ...p, stock: found.stock } : p;
      }),
    }));
  },
    addClient: (newClient) => {
    set((state) => ({
      clients: [{ ...newClient, bikes: newClient.bikes || [] }, ...state.clients],
    }));
  },

  updateClient: (updatedClient) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c._id === updatedClient._id ? { ...c, ...updatedClient } : c
      ),
    }));
  },

  // --- Bicicletas ---
  addBikeToClient: (clientId, newBike) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c._id === clientId ? { ...c, bikes: [...c.bikes, newBike] } : c
      ),
    }));
  },

  updateBike: (clientId, updatedBike) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c._id === clientId
          ? {
              ...c,
              bikes: c.bikes.map((b) =>
                b._id === updatedBike._id ? { ...b, ...updatedBike } : b
              ),
            }
          : c
      ),
    }));
  },
}));
