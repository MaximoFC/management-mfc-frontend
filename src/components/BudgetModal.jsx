import { useEffect, useState } from "react";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";
import { createBudget } from "../services/budgetService"; 
import { getCurrentEmployee } from "../services/authService"; 

const BudgetModal = ({ closeModal, selectedServices, selectedBikeparts }) => {
  const [clients, setClients] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [clientId, setClientId] = useState("");
  const [bikeId, setBikeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchClients().then(setClients);
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchBikesByClient(clientId).then(setBikes);
    } else {
      setBikes([]);
      setBikeId("");
    }
  }, [clientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Trae el empleado logueado
    const currentEmployee = getCurrentEmployee();
    const employeeId = currentEmployee?._id || currentEmployee?.id;

    console.log("Empleado actual:", currentEmployee);

    // Si falta, no sigue
    if (!currentEmployee || !employeeId) {
      setMsg({ type: "error", text: "No hay empleado logueado o falta el ID." });
      setLoading(false);
      return;
    }

    // uso _id -> razon, el auth usa id y no con _ Ahora anda bien pero habría que verlo tal vez a futuro 
    const budgetData = {
      bike_id: bikeId,
      employee_id: employeeId,
      parts: selectedBikeparts.map(bp => ({
        bikepart_id: bp.bikepart_id,
        amount: bp.amount
      })),
      services: selectedServices.map(s => ({
        service_id: typeof s === "string"
          ? s
          : typeof s.service_id === "string"
          ? s.service_id
          : s.service_id?._id
        }))
      };
    console.log("BudgetData a enviar:", budgetData);

    try {
      await createBudget(budgetData);
      setMsg({ type: "success", text: "¡Presupuesto creado exitosamente!" });
      setTimeout(() => closeModal(), 1200);
    } catch (e) {
      setMsg({ type: "error", text: "Error al crear el presupuesto." });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[450px] relative">
        <button
          className="absolute right-3 top-3 text-gray-400 text-lg hover:text-red-500"
          onClick={closeModal}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-6">Generar presupuesto</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Cliente</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.surname}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Bici</label>
            <select
              value={bikeId}
              onChange={e => setBikeId(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
              disabled={!clientId}
            >
              <option value="">Seleccionar bici...</option>
              {bikes.map(b => (
                <option key={b._id} value={b._id}>
                  {b.brand} {b.model}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold w-full mt-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creando..." : "Confirmar"}
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

export default BudgetModal;


