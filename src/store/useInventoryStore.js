import { create } from "zustand";
import { fetchServices } from "../services/serviceService";
import { fetchBikeparts } from "../services/bikepartService";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";

export const useInventoryStore = create((set, get) => ({
  services: [],
  bikeparts: [],
  clients: [],
  initialized: false,
  loadingBootstrap: false,

  fetchBootstrap: async () => {
    if (get().initialized) return;

    set({ loadingBootstrap: true });

    try {
      const [services, bikeparts, clientsData] = await Promise.all([
        fetchServices(),
        fetchBikeparts(),
        fetchClients(),
      ]);

      const clientsWithBikes = await Promise.all(
        clientsData.map(async (client) => {
          const bikes = await fetchBikesByClient(client._id);
          return { ...client, bikes };
        })
      );

      set({
        services,
        bikeparts,
        clients: clientsWithBikes,
        initialized: true,
        loadingBootstrap: false,
      });
    } catch (err) {
      console.error("Inventory bootstrap error:", err);
      set({ loadingBootstrap: false });
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
      clients: [...state.clients, { ...newClient, bikes: [] }],
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
