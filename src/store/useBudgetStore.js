import { create } from "zustand";

export const useBudgetStore = create((set) => ({
    clientId: null,
    bikeId: null,

    selectedService: [],
    selectedBikeparts: [],
    coveredServices: [],

    setClientId: (id) => set({ clientId: id }),
    setBikeId: (id) => set({ bikeId: id }),

    addService: (service) =>
        set((state) => ({
            selectedServices: state.selectedServices.some(s => s._id === service._id)
            ? state.selectedServices
            : [...state.selectedServices, service]
    })),

    removeService: (id) =>
        set((state) => ({
            selectedServices: state.selectedServices.filter(s => s._id !== id),
            coveredServices: state.coveredServices.filter(c => c !== id)
    })),

    toggleService: (service) =>
        set((state) => {
            const exists = state.selectedServices.some(s => s._id === service._id);
            
            if (exists) {
                return {
                    selectedServices: state.selectedServices.filter(s => s._id !== service._id),
                    coveredServices: state.coveredServices.filter(c => c !== service._id)
                };
            }
        
            return {
                selectedServices: [...state.selectedServices, service]
            };
    }),

    addBikepart: (id) =>
        set((state) => {
            const exists = state.selectedBikeparts.find(p => p.bikepart_id === id);
            
            if (exists) {
                return {
                    selectedBikeparts: state.selectedBikeparts.filter(p => p.bikepart_id !== id)
                };
            }
        
            return {
                selectedBikeparts: [...state.selectedBikeparts, { bikepart_id: id, amount: 1 }]
            };
    }),

    updateBikepartAmount: (id, amount) =>
        set((state) => ({
            selectedBikeparts: state.selectedBikeparts.map(p =>
                p.bikepart_id === id ? { ...p, amount } : p
            )
    })),
    
    removeBikepart: (id) =>
        set((state) => ({
            selectedBikeparts: state.selectedBikeparts.filter(p => p.bikepart_id !== id)
        })),
    
    clearBudget: () =>
        set({
            selectedServices: [],
            selectedBikeparts: [],
            coveredServices: [],
            clientId: null,
            bikeId: null
        })
}));