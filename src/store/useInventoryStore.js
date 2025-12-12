import { create } from "zustand";
import { fetchBikeparts } from "../services/bikepartService";
import { fetchServices } from "../services/serviceService";

export const useInventoryStore = create((set, get) => ({
  services: [],
  bikeparts: [],

  initialized: false,
  loading: false,

  fetchAllInventory: async () => {
    if (get().initialized) return;

    try {
      set({ loading: true });

      const [services, bikeparts] = await Promise.all([
        fetchServices(),
        fetchBikeparts(),
      ]);

      set({
        services,
        bikeparts,
        initialized: true,
        loading: false,
      });
    } catch (err) {
      console.error("Error cargando inventario global:", err);
      set({ loading: false });
    }
  },

  // --- SERVICES ---
  addService: (service) =>
    set((state) => ({
      services: [...state.services, service],
    })),

  updateService: (service) =>
    set((state) => ({
      services: state.services.map((s) =>
        s._id === service._id ? service : s
      ),
    })),

  removeService: (id) =>
    set((state) => ({
      services: state.services.filter((s) => s._id !== id),
    })),

  // --- BIKEPARTS ---
  addPart: (part) =>
    set((state) => ({
      bikeparts: [...state.bikeparts, part],
    })),

  updatePart: (part) =>
    set((state) => ({
      bikeparts: state.bikeparts.map((p) =>
        p._id === part._id ? part : p
      ),
    })),

  removePart: (id) =>
    set((state) => ({
      bikeparts: state.bikeparts.filter((p) => p._id !== id),
    })),
}));
