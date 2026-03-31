import { useState } from "react";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { useInventoryStore } from "../store/useInventoryStore";
import { addClient as addClientService } from "../services/clientService"; // Backend
import { FaBicycle } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { addBike as addBikeService } from "../services/bikeService";

function NewClient({ showModal, onClose }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bikes, setBikes] = useState([{ brand: "", model: "", color: "" }]);

  const addClientToStore = useInventoryStore((state) => state.addClient);

  const resetForm = () => {
    setName("");
    setSurname("");
    setMobileNum("");
    setBikes([{ brand: "", model: "", color: "" }]);
    setError("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Crear cliente
      const newClient = await addClientService({
        name,
        surname,
        mobileNum,
      });

      // 2. Crear bicicletas asociadas
      const validBikes = bikes.filter((b) => b.brand && b.model && b.color);

      const createdBikes = await Promise.all(
        validBikes.map((bike) =>
          addBikeService({
            brand: bike.brand,
            model: bike.model,
            color: bike.color,
            current_owner_id: newClient._id,
          })
        )
      );

      // 3. Unir todo para el store
      const clientWithBikes = {
        ...newClient,
        bikes: createdBikes,
      };

      // 4. Guardar en store
      addClientToStore(clientWithBikes);

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

  const addBike = () => {
    setBikes([...bikes, { brand: "", model: "", color: "" }]);
  };

  const removeBike = (index) => {
    setBikes(bikes.filter((_, i) => i !== index));
  };

  const updateBike = (index, field, value) => {
    const updated = [...bikes];
    updated[index][field] = value;
    setBikes(updated);
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
      <div className="flex flex-col gap-6">

        {/* Nombre + Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nombre"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Apellido"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>

        {/* Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Teléfono</label>
            <input
              placeholder="+54 11 1234-5678"
              className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              value={mobileNum}
              onChange={(e) => setMobileNum(e.target.value)}
            />
          </div>
        </div>

        {/* Bicicletas */}
        <div className="flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wide">
              BICICLETAS
            </h3>
          
            <button
              onClick={addBike}
              className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition"
            >
              + Agregar Bicicleta
            </button>
          </div>
          
          {/* Lista */}
          <div className="flex flex-col gap-3">
            {bikes.map((bike, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                {/* Icono */}
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <FaBicycle className="text-blue-500" />
                </div>
            
                {/* Inputs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    placeholder="Marca"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={bike.brand}
                    onChange={(e) =>
                      updateBike(index, "brand", e.target.value)
                    }
                  />
        
                  <input
                    placeholder="Modelo"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={bike.model}
                    onChange={(e) =>
                      updateBike(index, "model", e.target.value)
                    }
                  />
        
                  <input
                    placeholder="Color"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={bike.color}
                    onChange={(e) =>
                      updateBike(index, "color", e.target.value)
                    }
                  />
                </div>
                  
                {/* Delete */}
                <button
                  onClick={() => removeBike(index)}
                  className="self-end sm:self-auto text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </div>
    </Modal>
  );
}

export default NewClient;
