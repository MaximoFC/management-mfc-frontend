import { create } from "zustand";
import { fetchServices } from "../services/serviceService";
import { fetchBikeparts } from "../services/bikepartService";

export const useInventoryStore = create((set, get) => ({
  services: [],
  bikeparts: [],

  initialized: false,
  loadingBootstrap: false,

  fetchBootstrap: async () => {
    if (get().initialized) return;

    set({ loadingBootstrap: true });

    try {
      const [services, bikeparts] = await Promise.all([
        fetchServices(),
        fetchBikeparts(),
      ]);

      set({
        services,
        bikeparts,
        initialized: true,
        loadingBootstrap: false
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
}));
