import { useState } from "react";
import Modal from "../components/Modal";
import { useInventoryStore } from "../store/useInventoryStore";
import { addBike as addBikeService } from "../services/bikeService";

const initialForm = { brand: "", model: "", color: "" };

export default function ClientBikesModal({ client, closeModal }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const addBikeToClientStore = useInventoryStore(
    (state) => state.addBikeToClient
  );

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const newBike = await addBikeService({
        ...form,
        current_owner_id: client._id,
        active: true,
      });

      // Agregar bicicleta a la store
      addBikeToClientStore(client._id, newBike);

      setForm(initialForm);
      setMsg({ type: "success", text: "Bicicleta agregada" });
    } catch {
      setMsg({ type: "error", text: "Error al agregar la bicicleta." });
    }

    setLoading(false);
  };

  return (
    <Modal
      title={`Bicicletas de ${client.name} ${client.surname}`}
      onClose={closeModal}
      showCancel={false}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Columna izquierda - Lista de bicicletas */}
        <div className="md:w-1/2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6">
          <h3 className="text-lg font-semibold mb-3">Bicicletas registradas</h3>
          {client.bikes.length === 0 ? (
            <p className="text-gray-500">
              No hay bicicletas para este cliente.
            </p>
          ) : (
            <ul className="space-y-2">
              {client.bikes.map((b) => (
                <li key={b._id} className="border rounded-md p-2">
                  <div className="font-medium">
                    {b.brand} {b.model}
                  </div>
                  <div className="text-gray-500 text-sm">Color: {b.color}</div>
                  <div className="text-xs text-gray-400">ID: {b._id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Columna derecha - Formulario */}
        <div className="md:w-1/2 md:pl-6">
          <h3 className="text-lg font-semibold mb-3">Agregar bicicleta</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="brand"
              placeholder="Marca"
              value={form.brand}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              name="model"
              placeholder="Modelo"
              value={form.model}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              name="color"
              placeholder="Color"
              value={form.color}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold w-full sm:w-auto"
              >
                {loading ? "Agregando..." : "Agregar bicicleta"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cerrar
              </button>
            </div>

            {msg && (
              <div
                className={`text-center mt-3 ${
                  msg.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </Modal>
  );
}
