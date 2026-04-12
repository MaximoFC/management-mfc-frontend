import { useState } from "react";
import { loginEmployee } from "../services/authService";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Logo from '/Logo MFC.jpg';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ClipLoader from "react-spinners/ClipLoader";
import { FiUser, FiLock } from "react-icons/fi";
import { useLocation } from "react-router-dom";

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const res = await loginEmployee(data.email, data.password);
            login(res.employee, res.token);
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-gray-100 px-4">
    
            <div className="w-full max-w-sm flex flex-col items-center gap-5">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <img
                        src={Logo}
                        alt="Logo de MFC"
                        className="h-16 w-16 rounded-xl shadow-md"
                    />
                    <h1 className="text-xl font-bold text-gray-800">
                        MFC <span className="text-red-600">Admin</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Sistema de gestión de taller
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-4"
                >
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-800">
                            Iniciar sesión
                        </h2>
                        <p className="text-xs text-gray-500">
                            Ingresá tus credenciales para acceder al sistema
                        </p>
                    </div>

                    {/* Usuario */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Correo electrónico</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-red-500">
                            <FiUser className="text-gray-400 mr-2 text-sm" />
                            <input
                                type="email"
                                placeholder="Ingresá tu correo electrónico"
                                {...register("email")}
                                className="w-full outline-none bg-transparent text-sm"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs">{errors.email.message}</p>
                        )}
                    </div>
                    
                    {/* Contraseña */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Contraseña</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-red-500">
                            <FiLock className="text-gray-400 mr-2 text-sm" />
                            <input
                                type="password"
                                placeholder="Ingresá tu contraseña"
                                {...register("password")}
                                className="w-full outline-none bg-transparent text-sm"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>
                    
                    {/* Recuperar contraseña */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    
                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-10 rounded-md text-white text-sm font-medium transition cursor-pointer ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {loading ? (
                            <ClipLoader color="#ffffff" size={18} />
                        ) : (
                            "Iniciar sesión"
                        )}
                    </button>
                    
                    {/* Nota */}
                    <p className="text-[10px] text-gray-400 text-center">
                      * La recuperación de contraseña estará disponible próximamente
                    </p>
                </form>
                
                {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                )}
            </div>
        </div>
    );
}

export default Login;