import { useState } from "react";
import { addClient } from "../services/clientService";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

function NewClient({ showModal, onClose, onClientAdded }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  const resetForm = () => {
    setName("");
    setSurname("");
    setMobileNum("");
    setError("");
    setLoading("");
  };
=======
>>>>>>> 113110cba41e7cff380bce569cbe5f86b6adf40b

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await addClient({ name, surname, mobileNum });
<<<<<<< HEAD
      toast.success("Cliente agregado con éxito");
      
      //Avisar al componente padre que se agregó un cliente
      if (onClientAdded) onClientAdded();

      resetForm();
      onClose();
=======
      onClose(); // Cerrar modal
      if (onClientAdded) onClientAdded();
      // resetear formulario
      setName("");
      setSurname("");
      setMobileNum("");
>>>>>>> 113110cba41e7cff380bce569cbe5f86b6adf40b
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
