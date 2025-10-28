import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!employee;

    useEffect(() => {
        let isMounted = true;
        let verifying = false; // evita solicitudes duplicadas

        const verifyToken = async () => {
            if (verifying) return; // si ya se está verificando, no hace nada
            verifying = true;

            const token = localStorage.getItem("token");

            if (!token) {
                if (isMounted) setLoading(false);
                verifying = false;
                return;
            }

            try {
                const employeeData = await getProfile();

                if (isMounted) {
                    setToken(token);
                    setEmployee(employeeData);
                }
            } catch (error) {
                console.error("Error verifying profile:", error.message);
                if (isMounted) logout();
            } finally {
                if (isMounted) setLoading(false);
                verifying = false;
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, []);


    const login = (employeeData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setToken(token);
        setEmployee(employeeData);
    };

    const logout = () => {
        setEmployee(null);
        setToken(null);
        
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ employee, token, login, logout, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
