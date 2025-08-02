import { useState } from "react";
import { createService } from "../services/serviceService";

const AddServiceModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price_usd, setPriceUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const data = await createService({
        name,
        description,
        price_usd: Number(price_usd)
      });
      setMsg({ type: "success", text: "Servicio creado!" });
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 500);
    } catch (err) {
      setMsg({ type: "error", text: "Error al crear servicio" });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] relative">
        <button
          className="absolute right-3 top-3 text-gray-400 text-lg hover:text-red-500"
          type="button"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-6">Agregar servicio</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border rounded p-2"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Descripción</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Costo (USD)</label>
            <input
              type="number"
              min={1}
              value={price_usd}
              onChange={e => setPriceUsd(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold w-full mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Agregando..." : "Agregar"}
          </button>
          {msg && (
            <div className={`mt-2 text-center ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;

