import { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../services/api"; // axios configurado

const EditBudgetModal = ({ budget, onClose, onSave }) => {
  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);

  const [availableServices, setAvailableServices] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);

  const [total, setTotal] = useState(0);

  useEffect(() => {
    setServices(
      (budget.services || []).map(s => ({
        _id: s.service_id || s._id,
        name: s.name,
        price: s.price
      }))
    );
    setParts(
      (budget.parts || []).map(p => ({
        _id: p.bikepart_id || p._id,
        description: p.description || p.bikepart_id?.description,
        price: p.price,
        amount: p.amount
      }))
    );
    setTotal(budget.total_ars || 0);
  }, [budget]);

  // Load all available services and parts
  useEffect(() => {
    async function load() {
      const [srv, prt] = await Promise.all([
        api.get("/services"),
        api.get("/bikeparts"),
      ]);
      setAvailableServices(srv.data);
      setAvailableParts(prt.data);
    }
    load();
  }, []);

  const calculateTotal = (newServices, newParts) => {
    const serviceTotal = newServices.reduce((acc, s) => acc + (s.price || 0), 0);
    const partsTotal = newParts.reduce(
      (acc, p) => acc + (Number(p.price) * Number(p.amount)),
      0
    );
    return serviceTotal + partsTotal;
  };

  const handleConfirm = () => {
    const payload = {
      state: budget.state,
      services: services.map(s => ({
        service_id: s._id,
        name: s.name,
        price: s.price
      })),
      parts: parts.map(p => ({
        bikepart_id: p._id,
        price: p.price,
        amount: p.amount
      })),
      total_ars: total
    };

    onSave(payload);
  };

  // -------- Services ---------

  const addService = () => {
    setServices([...services, { _id: "", name: "", price: 0 }]);
  };

  const updateService = (index, serviceId) => {
    const srv = availableServices.find(s => s._id === serviceId);
    const updated = [...services];
    updated[index] = {
      _id: srv._id,
      name: srv.name,
      price: srv.price
    };
    setServices(updated);
    setTotal(calculateTotal(updated, parts));
  };

  const removeService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    setTotal(calculateTotal(updated, parts));
  };

  // -------- Parts ---------

  const addPart = () => {
    setParts([...parts, { _id: "", description: "", price: 0, amount: 1 }]);
  };

  const updatePart = (index, partId) => {
    const part = availableParts.find(p => p._id === partId);
    const updated = [...parts];

    updated[index] = {
      _id: part._id,
      description: part.description,
      price: part.price_ars,
      amount: 1
    };

    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  const updatePartAmount = (index, value) => {
    const updated = [...parts];
    updated[index].amount = Number(value);
    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  const removePart = (index) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  // ------------------------------------------------

  return (
    <Modal title="Editar presupuesto" onClose={onClose} onConfirm={handleConfirm}>

      {/* --- SERVICES --- */}
      <h3 className="text-lg font-semibold mb-2">Servicios</h3>
      {services.map((s, idx) => (
        <div key={idx} className="flex gap-3 items-center">
          <select
            value={s._id}
            className="border rounded px-3 py-1 flex-1"
            onChange={(e) => updateService(idx, e.target.value)}
          >
            <option value="">Seleccionar servicio...</option>
            {availableServices.map(srv => (
              <option key={srv._id} value={srv._id}>
                {srv.name} (${srv.price})
              </option>
            ))}
          </select>

          <button className="text-red-500" onClick={() => removeService(idx)}>✖</button>
        </div>
      ))}

      <button
        onClick={addService}
        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
      >
        + Agregar servicio
      </button>


      {/* --- PARTS --- */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Repuestos</h3>

      {parts.map((p, idx) => (
        <div key={idx} className="flex gap-3 items-center">
          <select
            value={p._id}
            className="border rounded px-3 py-1 flex-1"
            onChange={(e) => updatePart(idx, e.target.value)}
          >
            <option value="">Seleccionar repuesto...</option>

            {availableParts.map(part => (
              <option key={part._id} value={part._id}>
                {part.description} - ${part.price_ars} (stock: {part.stock})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            className="border rounded px-3 py-1 w-20"
            value={p.amount}
            onChange={(e) => updatePartAmount(idx, e.target.value)}
          />

          <button className="text-red-500" onClick={() => removePart(idx)}>✖</button>
        </div>
      ))}

      <button
        onClick={addPart}
        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
      >
        + Agregar repuesto
      </button>

      <div className="mt-6 text-right">
        <p className="text-xl font-bold text-green-700">
          Total: ${total.toLocaleString("es-AR")}
        </p>
      </div>

    </Modal>
  );
};

export default EditBudgetModal;
