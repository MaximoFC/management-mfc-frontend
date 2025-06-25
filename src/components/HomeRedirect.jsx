import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeRedirect = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-10">Verificando sesión...</div>
    }

    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
}

export default HomeRedirect;