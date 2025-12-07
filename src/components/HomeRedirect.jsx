import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";

const HomeRedirect = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-dvh">
                <ClipLoader color="#ef4444" size={50} />
                <p className="mt-4 text-gray-600 text-sm">Verificando sesión...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace/>
    }

    return <Navigate to="/login" replace />
}

export default HomeRedirect;