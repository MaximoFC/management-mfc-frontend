import { useEffect } from "react";
import { useInventoryStore } from "../store/useInventoryStore";
import { useAuth } from "../context/AuthContext";

export default function InventoryBootstrapper({ children }) {
    const { isAuthenticated } = useAuth();

    const fetchAllInventory = useInventoryStore(s => s.fetchAllInventory);
    const initialized = useInventoryStore(s => s.initialized);
    const loading = useInventoryStore(s => s.loading);

    useEffect(() => {
        if (isAuthenticated && !initialized) {
            fetchAllInventory();
        }
    }, [isAuthenticated, initialized]);

    if (!isAuthenticated || loading) {
        return <div className="text-center mt-10">Cargando inventario...</div>;
    }

    return children;
}
