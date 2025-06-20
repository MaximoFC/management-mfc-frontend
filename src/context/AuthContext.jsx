import { createContext, useContext, useEffect, useState } from "react";
import { getToken, getCurrentEmployee } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = getToken();
        const storedEmployee = getCurrentEmployee();
        if (storedToken && storedEmployee) {
            setToken(storedToken);
            setEmployee(storedEmployee);
        }
    }, []);

    const login = (employeeData, token) => {
        setEmployee(employeeData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('employee', JSON.stringify(employeeData));
    };

    const logout = () => {
        setEmployee(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
    };

    return (
        <AuthContext.Provider value={{ employee, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);