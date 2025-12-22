import { useState } from "react";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { useInventoryStore } from "../store/useInventoryStore";
import { addClient as addClientService } from "../services/clientService"; // Backend

function NewClient({ showModal, onClose }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addClientToStore = useInventoryStore((state) => state.addClient);

  const resetForm = () => {
    setName("");
    setSurname("");
    setMobileNum("");
    setError("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // Llamada al backend
      const newClient = await addClientService({ name, surname, mobileNum });

      // Agregar a la store
      addClientToStore(newClient);

      toast.success("Cliente agregado con éxito");

      resetForm();
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error("Ocurrió un error al agregar el cliente");
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!showModal) return null;

  return (
    <Modal
      title="Agregar nuevo cliente"
      onClose={handleClose}
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
