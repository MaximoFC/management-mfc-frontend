import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { registerWithToken } from "../services/authService";
import Logo from "/Logo MFC.jpg";
import { FiUser, FiLock } from "react-icons/fi";

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!token) setError("Token inválido");
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await registerWithToken({ token, name, password });
            setSuccess("Cuenta creada correctamente");

            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-sm flex flex-col items-center gap-5">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <img src={Logo} className="h-16 w-16 rounded-xl shadow-md" />
                    <h1 className="text-xl font-bold text-gray-800">
                        MFC <span className="text-red-600">Admin</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Crear cuenta
                    </p>
                </div>

                <form className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                    
                    {/* Nombre */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Nombre</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10">
                            <FiUser className="mr-2 text-gray-400" />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full outline-none bg-transparent text-sm"
                                placeholder="Tu nombre"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Contraseña</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10">
                            <FiLock className="mr-2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none bg-transparent text-sm"
                                placeholder="Tu contraseña"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    {success && <p className="text-green-500 text-xs">{success}</p>}

                    <button className="h-10 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer">
                        Crear cuenta
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;