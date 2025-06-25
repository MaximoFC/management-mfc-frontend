import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!employee;

    const isCancelled = useRef(false);

    useEffect(() => {
        isCancelled.current = false;

        const verifyToken = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                if (!isCancelled.current) setLoading(false);
                return;
            }

            try {
                const employeeData = await getProfile();

                if (!isCancelled.current) {
                    setToken(token);
                    setEmployee(employeeData);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error verifying profile: ', error.message);
                if (!isCancelled.current) {
                    logout();
                }
            }
        };

        verifyToken();

        return () => {
            isCancelled.current = true;
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
