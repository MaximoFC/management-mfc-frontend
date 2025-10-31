import { useState } from "react";
import { createService } from "../services/serviceService";
import Modal from "../components/Modal";

const AddServiceModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price_usd, setPriceUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await createService({ name, description, price_usd: Number(price_usd) });
      setMsg({ type: "success", text: "Servicio creado!" });
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 500);
    } catch {
      setMsg({ type: "error", text: "Error al crear servicio" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Agregar servicio"
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmText={loading ? "Agregando..." : "Agregar"}
      disableConfirm={loading || !name || !description || !price_usd}
    >
      <div className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="border rounded p-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          className="border rounded p-2"
        />
        <input
          type="number"
          step="0.01"
          value={price_usd}
          onChange={(e) => setPriceUsd(e.target.value)}
          placeholder="Costo (USD)"
          className="border rounded p-2"
        />

        {msg && (
          <div
            className={`text-center ${
              msg.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddServiceModal;