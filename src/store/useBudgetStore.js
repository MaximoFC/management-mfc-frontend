import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useBudgetStore = create(
    persist(
        (set) => ({
            
            clientId: null,
            clientLabel: "",
            bikeId: null,
            
            selectedServices: [],
            selectedBikeparts: [],
            coveredServices: [],
            
            setClientId: (id, label = "") => set({ clientId: id, clientLabel: label }),
            setBikeId: (id) => set({ bikeId: id }),
            
            toggleService: (service) =>
                set((state) => {
                    const exists = state.selectedServices.some(
                        (s) => s._id === service._id
                    );
                
                    if (exists) {
                        return {
                            selectedServices: state.selectedServices.filter(
                                (s) => s._id !== service._id
                            ),
                            coveredServices: state.coveredServices.filter(
                                (id) => id !== service._id
                            ),
                        };
                    }
                
                    return {
                        selectedServices: [...state.selectedServices, service],
                    };
                }),
            
            updateSelectedService: (service) =>
                set((state) => ({
                    selectedServices: state.selectedServices.map((s) =>
                        s._id === service._id ? { ...s, ...service } : s
                    ),
                })),

            removeService: (id) =>
                set((state) => ({
                    selectedServices: state.selectedServices.filter(
                        (s) => s._id !== id
                    ),
                    coveredServices: state.coveredServices.filter((c) => c !== id),
                })),
            
            setCoveredServices: (ids) => set({ coveredServices: ids }),

            toggleCoveredService: (id) =>
                set((state) => {
                    const exists = state.coveredServices.includes(id);
                    
                    if (exists) {
                        return {
                            coveredServices: state.coveredServices.filter(
                                (c) => c !== id
                            ),
                        };
                    }
                
                    return {
                        coveredServices: [...state.coveredServices, id],
                    };
                }),
            
            // Guarda una copia del repuesto: el catálogo ya no está cargado completo en memoria
            addBikepart: (part) =>
                set((state) => {
                    const id = part._id;
                    const exists = state.selectedBikeparts.find(
                        (p) => p.bikepart_id === id
                    );
                
                    if (exists) {
                        return {
                            selectedBikeparts: state.selectedBikeparts.filter(
                                (p) => p.bikepart_id !== id
                            ),
                        };
                    }
                
                    return {
                        selectedBikeparts: [
                            ...state.selectedBikeparts,
                            { bikepart_id: id, amount: 1, part },
                        ],
                    };
                }),
            
            updateBikepartAmount: (id, amount) =>
                set((state) => ({
                    selectedBikeparts: state.selectedBikeparts.map((p) =>
                        p.bikepart_id === id ? { ...p, amount: Number(amount) } : p
                    ),
                })),
            
            removeBikepart: (id) =>
                set((state) => ({
                    selectedBikeparts: state.selectedBikeparts.filter(
                        (p) => p.bikepart_id !== id
                    ),
                })),
            
            clearBudget: () =>
                set({
                    clientId: null,
                    clientLabel: "",
                    bikeId: null,
                    selectedServices: [],
                    selectedBikeparts: [],
                    coveredServices: [],
                }),
        }),
        {
            name: "budget-storage",
            version: 1,
            // Borradores guardados con el formato anterior (repuestos sin copia) se descartan
            migrate: () => ({}),
        }
    )
);