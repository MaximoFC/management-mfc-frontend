import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!token && !!employee;

    useEffect(() => {
        let isMounted = true;

        const verifyToken = async () => {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const employeeData = await getProfile();
                    if (isMounted) {
                        setToken(storedToken);
                        setEmployee(employeeData);
                    }
            } catch (error) {
                console.error("Error verifying profile:", error.message);

                if (error.message === "Token expired") {
                    console.warn("Sesión expirada. Limpiando...");
                }

                localStorage.removeItem("token");
                localStorage.removeItem("employee");

                if (isMounted) {
                    setToken(null);
                    setEmployee(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        verifyToken();
        return () => { isMounted = false };
    }, []);

    const login = (employeeData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("employee", JSON.stringify(employeeData));

        setToken(token);
        setEmployee(employeeData);

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("employee");

        delete api.defaults.headers.common["Authorization"];

        setEmployee(null);
        setToken(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ employee, token, login, logout, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
