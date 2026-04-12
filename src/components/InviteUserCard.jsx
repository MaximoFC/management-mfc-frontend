import { useState } from "react";
import { createInvitation } from "../services/authService";

const InviteUserCard = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [link, setLink] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");
        setLink("");

        try {
            setLoading(true);

            const res = await createInvitation(email);

            setMessage("Invitación enviada correctamente");
            setLink(res.link);

            setEmail("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-5 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">
                Invitar empleado
            </h3>

            {message && (
                <p className="text-green-600 text-sm mb-2">{message}</p>
            )}

            {error && (
                <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? "Enviando..." : "Enviar invitación"}
                </button>
            </form>

            {link && (
                <div className="mt-4 text-xs">
                    <p className="mb-1 text-gray-600">Link de invitación:</p>

                    <div className="flex items-center gap-2">
                        <input
                            value={link}
                            readOnly
                            className="border rounded px-2 py-1 w-full text-xs"
                        />

                        <button
                            onClick={copyLink}
                            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                        >
                            Copiar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InviteUserCard;