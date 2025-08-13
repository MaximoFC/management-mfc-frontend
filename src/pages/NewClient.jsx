import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addClient } from "../services/clientService";

function NewClient() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addClient({ name, surname, mobileNum });
      navigate("/clientes");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 flex flex-col justify-center gap-4 rounded-md shadow-md border border-gray-200 bg-white"
      >
        <h2 className="text-2xl font-bold text-center">
          Agregar nuevo cliente
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Nombre *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Apellido *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Número de teléfono *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={mobileNum}
            onChange={(e) => setMobileNum(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <button
          type="submit"
          className="rounded-md bg-red-500 text-white cursor-pointer p-2 hover:bg-red-700"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Agregar cliente"}
        </button>
      </form>
    </div>
  );
}

export default NewClient;
