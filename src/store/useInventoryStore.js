import { create } from "zustand";
import api from "../services/api";

export const useInventoryStore = create((set, get) => ({
    services: [],
    bikeparts: [],
    loadingBootstrap: false,
    initialized: false,

    fetchBootstrap: async () => {
        if (get().initialized) return;
        try {
            set({ loadingBootstrap: true });
            const res = await api.get("/bootstrap");
            const { services, bikeparts } = res.data;
            set({ services, bikeparts, loadingBootstrap: false, initialized: true });
        } catch (err) {
            console.error("Error cargando bootstrap:", err);
            set({ loadingBootstrap: false, initialized: true });
        }
    },

    // --- Servicios ---
    addService: async (serviceData) => {
        try {
            const res = await api.post("/services", serviceData);
            set((state) => ({
                services: [...state.services, res.data],
            }));
        } catch (err) {
            console.error("Error agregando servicio:", err);
        }
    },

    updateService: async (id, serviceData) => {
        try {
            const res = await api.put(`/services/${id}`, serviceData);
            set((state) => ({
                services: state.services.map(s =>
                    s._id === id ? res.data : s
                ),
            }));
        } catch (err) {
            console.error("Error actualizando servicio:", err);
        }
    },

    // --- Repuestos ---
    addBikePart: async (partData) => {
        try {
            const res = await api.post("/bikeparts", partData);
            set((state) => ({
                bikeparts: [...state.bikeparts, res.data],
            }));
        } catch (err) {
            console.error("Error agregando repuesto:", err);
        }
    },

    updateBikePart: async (id, partData) => {
        try {
            const res = await api.put(`/bikeparts/${id}`, partData);
            set((state) => ({
                bikeparts: state.bikeparts.map(p =>
                    p._id === id ? res.data : p
                ),
            }));
        } catch (err) {
            console.error("Error actualizando repuesto:", err);
        }
    },

    addServiceLocal: (newService) => {
        set((state) => ({
            services: [newService, ...state.services]
        }));
    },

    updateLocalBikepartStock: (id, newStock) => {
        set((state) => ({
            bikeparts: state.bikeparts.map(p => p._id === id ? { ...p, stock: newStock } : p)
        }));
    },

    setMultipleBikepartStocks: (items) => {
        set((state) => ({
            bikeparts: state.bikeparts.map(p => {
                const found = items.find(it => it.id === p._id);
                return found ? { ...p, stock: found.stock } : p;
            })
        }));
    }
}));
