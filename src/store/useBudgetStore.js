import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useBudgetStore = create(
    persist(
        (set, get) => ({
            
            clientId: null,
            bikeId: null,
            
            selectedServices: [],
            selectedBikeparts: [],
            coveredServices: [],
            
            setClientId: (id) => set({ clientId: id }),
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
            
            removeService: (id) =>
                set((state) => ({
                    selectedServices: state.selectedServices.filter(
                        (s) => s._id !== id
                    ),
                    coveredServices: state.coveredServices.filter((c) => c !== id),
                })),
            
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
            
            addBikepart: (id) =>
                set((state) => {
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
                            { bikepart_id: id, amount: 1 },
                        ],
                    };
                }),
            
            updateBikepartAmount: (id, amount) =>
                set((state) => ({
                    selectedBikeparts: state.selectedBikeparts.map((p) =>
                        p.bikepart_id === id ? { ...p, amount } : p
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
                    bikeId: null,
                    selectedServices: [],
                    selectedBikeparts: [],
                    coveredServices: [],
                }),
        }),
        {
            name: "budget-storage",
        }
    )
);