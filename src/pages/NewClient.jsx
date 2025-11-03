import { useState } from "react";
import { addClient } from "../services/clientService";
import Modal from "../components/Modal"; // Asegurate de importar correctamente

function NewClient({ showModal, onClose, onClientAdded }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await addClient({ name, surname, mobileNum });
      onClose(); // Cerrar modal
      if (onClientAdded) onClientAdded();
      // resetear formulario
      setName("");
      setSurname("");
      setMobileNum("");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <Modal
      title="Agregar nuevo cliente"
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmText={loading ? "Guardando..." : "Agregar cliente"}
      cancelText="Cancelar"
      disableConfirm={loading || !name || !surname || !mobileNum}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Nombre *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Apellido *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Número de teléfono *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={mobileNum}
            onChange={(e) => setMobileNum(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    </Modal>
  );
}

export default NewClient;
