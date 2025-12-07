import { useEffect } from "react";
import { useInventoryStore } from "../store/useInventoryStore";
import { useAuth } from "../context/AuthContext";

export default function InventoryBootstrapper({ children }) {
    const { isAuthenticated } = useAuth();
    const fetchBootstrap = useInventoryStore((s) => s.fetchBootstrap);
    const initialized = useInventoryStore((s) => s.initialized);
    const loadingBootstrap = useInventoryStore((s) => s.loadingBootstrap);

    useEffect(() => {
        if (isAuthenticated && !initialized) {
            fetchBootstrap();
        }
    }, [isAuthenticated, initialized, fetchBootstrap]);

    if (!isAuthenticated || loadingBootstrap) {
        return <div className="text-center mt-10">Cargando inventario...</div>
    }

    return children;
}
