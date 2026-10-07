import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Logo from "/Logo MFC.jpg";
import { FiLock } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Token inválido o faltante");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!password || !confirmPassword) {
            return setError("Todos los campos son obligatorios");
        }

        if (password !== confirmPassword) {
            return setError("Las contraseñas no coinciden");
        }

        try {
            setLoading(true);

            await resetPassword({ token, password });

            setSuccess("Contraseña actualizada correctamente");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(err.message);
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
                        alt="Logo"
                        className="h-16 w-16 rounded-xl shadow-md"
                    />
                    <h1 className="text-xl font-bold text-gray-800">
                        MFC <span className="text-red-600">Admin</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Restablecer contraseña
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-4"
                >
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-800">
                            Nueva contraseña
                        </h2>
                        <p className="text-xs text-gray-500">
                            Ingresá tu nueva contraseña
                        </p>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Contraseña</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-red-500">
                            <FiLock className="text-gray-400 mr-2 text-sm" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nueva contraseña"
                                className="w-full outline-none bg-transparent text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Confirmar contraseña</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-red-500">
                            <FiLock className="text-gray-400 mr-2 text-sm" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repetir contraseña"
                                className="w-full outline-none bg-transparent text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Mensajes */}
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    {success && <p className="text-green-500 text-xs">{success}</p>}

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
                            "Actualizar contraseña"
                        )}
                    </button>

                    {/* Volver */}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-xs text-gray-500 hover:underline cursor-pointer"
                    >
                        Volver al login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;