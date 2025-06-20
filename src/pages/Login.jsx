import { useState } from "react";
import { loginEmployee } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Logo from '/Logo MFC.jpg';

function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginEmployee(name, password);
            login(res.employee, res.token);
            navigate('/dashboard');
            //Añadir limpieza del formulario cuando todo esté funcional
        } catch (error) {
            setError(error.message || 'Login error');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-dvh gap-4">
            <div className="flex flex-col items-center gap-2">
                <img
                    src={Logo}
                    alt="Logo de MFC"
                    className="h-20 w-20 rounded-full"
                />
                <h2 className="text-3xl font-bold">MFC Admin</h2>
                <p className="text-gray-600">Sistema de gestión de taller</p>
            </div>
            <form 
                onSubmit={handleSubmit}
                className="flex flex-col justify-center gap-4 border-1 border-gray-200 shadow-md rounded-xl p-6 text-center"
            >
                <h2 className="text-xl font-bold">Iniciar sesión</h2>
                <p className="text-gray-600">Ingresá tus credenciales para acceder al sistema</p>
                <input 
                    type="text" 
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-1 border-gray-200 rounded-md p-2"
                />
                <input 
                    type="password" 
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-1 border-gray-200 rounded-md p-2"
                />
                <button 
                    type="submit"
                    className="p-2 rounded-md cursor-pointer bg-red-500 text-white hover:bg-red-700"
                >
                    Iniciar sesión
                </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Login;