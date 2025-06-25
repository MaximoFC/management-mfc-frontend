import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-10">Verificando sesión...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;