import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Logo from "/Logo MFC.jpg";
import { FiMail } from "react-icons/fi";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await forgotPassword(email);
            setMessage("Si el email existe, se enviaron instrucciones");
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
                        Recuperar contraseña
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-4"
                >
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-800">
                            Recuperar contraseña
                        </h2>
                        <p className="text-xs text-gray-500">
                            Te enviaremos un enlace para restablecerla
                        </p>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Email</label>
                        <div className="flex items-center border border-gray-200 rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-red-500">
                            <FiMail className="text-gray-400 mr-2 text-sm" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ingresá tu email"
                                className="w-full outline-none bg-transparent text-sm"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    {message && <p className="text-green-500 text-xs">{message}</p>}

                    {/* Botón */}
                    <button className="w-full h-10 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 cursor-pointer transition">
                        Enviar instrucciones
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

export default ForgotPasswordPage;