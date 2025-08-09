import { useState } from "react";
import { loginEmployee } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Logo from '/Logo MFC.jpg';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
    name: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const res = await loginEmployee(data.name, data.password);
            login(res.employee, res.token);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-dvh gap-6 px-4">
            <div className="flex flex-col items-center gap-2">
                <img
                    src={Logo}
                    alt="Logo de MFC"
                    className="h-20 w-20 rounded-full"
                />
                <h2 className="text-2xl md:text-3xl font-bold">MFC Admin</h2>
                <p className="text-gray-600 text-center">Sistema de gestión de taller</p>
            </div>

            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm flex flex-col justify-center gap-4 border border-gray-200 shadow-md rounded-xl p-6 text-center bg-white"
            >
                <h2 className="text-lg md:text-xl font-bold">Iniciar sesión</h2>
                <p className="text-gray-600 text-sm md:text-base">Ingresá tus credenciales para acceder al sistema</p>
        
                <input 
                    type="text" 
                    placeholder="Nombre"
                    {...register("name")}
                    className="border border-gray-200 rounded-md p-2 w-full"
                />
                {errors.name && <p className="text-red-500 text-sm text-left">{errors.name.message}</p>}
        
                <input 
                    type="password" 
                    placeholder="Contraseña"
                    {...register("password")}
                    className="border border-gray-200 rounded-md p-2 w-full"
                />
                {errors.password && <p className="text-red-500 text-sm text-left">{errors.password.message}</p>}

                <button 
                    type="submit"
                    disabled={loading}
                    className={`p-2 rounded-md w-full text-white transition-colors duration-300 ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"
                    }`}
                >
                    {loading ? "Cargando..." : "Iniciar sesión"}
                </button>
            </form>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    )
}

export default Login;