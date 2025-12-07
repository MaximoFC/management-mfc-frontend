import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useInventoryStore } from "../store/useInventoryStore";
import { updateBikepart as apiUpdateBikepart } from "../services/bikepartService"; // si querés actualizar stock via API en otras acciones

const EditBudgetModal = ({ budget, onClose, onSave }) => {
  const availableServices = useInventoryStore(s => s.services || []);
  const availableParts = useInventoryStore(s => s.bikeparts || []);
  const setMultipleBikepartStocks = useInventoryStore(s => s.setMultipleBikepartStocks);

  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setServices(
      (budget.services || []).map(s => ({
        _id: s.service_id?._id || s.service_id || s._id || "",
        name: s.name || "",
        price: Number(s.price_usd ?? s.price ?? 0)
      }))
    );

    setParts(
      (budget.parts || []).map(p => ({
        _id: p.bikepart_id?._id || p.bikepart_id || p._id || "",
        description: p.description || p.bikepart_id?.description || "",
        price: Number(p.unit_price_usd ?? p.price ?? 0),
        amount: Number(p.amount || 1)
      }))
    );

    // initial total (usar moneda ARS si ya viene total_ars, sino calcular desde USD)
    if (budget.total_ars != null) {
      setTotal(Number(budget.total_ars));
    } else {
      const usd = (budget.total_usd != null) ? Number(budget.total_usd) : 0;
      const rate = Number(budget.dollar_rate_used || 1);
      setTotal(usd * rate);
    }
  }, [budget]);

  const calculateTotal = (newServices, newParts) => {
    // servicios -> precio USD -> convertir a ARS con dollar_rate_used para mostrar total en ARS
    const rate = Number(budget.dollar_rate_used || 1);
    const serviceUsdTotal = newServices.reduce((acc, s) => acc + (Number(s.price || 0)), 0);
    const partsUsdTotal = newParts.reduce(
      (acc, p) => acc + (Number(p.price || 0) * Number(p.amount || 0)),
      0
    );
    const totalUsd = serviceUsdTotal + partsUsdTotal;
    const totalArs = totalUsd * rate;
    return totalArs;
  };

  const handleConfirm = () => {
    const payload = {
      services: services.map(s => ({
        service_id: s._id,
      })),
      bikeparts: parts.map(p => ({
        bikepart_id: p._id,
        amount: Number(p.amount || 1),
      }))
    };

    onSave(payload);
  };

  // Services
  const addService = () => {
    setServices(prev => [...prev, { _id: "", name: "", price: 0 }]);
  };

  const updateService = (index, serviceId) => {
    const srv = availableServices.find(s => s._id === serviceId);
    if (!srv) return;

    const updated = [...services];
    updated[index] = {
      _id: srv._id,
      name: srv.name,
      price: Number(srv.price_usd || 0)
    };

    setServices(updated);
    setTotal(calculateTotal(updated, parts));
  };

  const removeService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    setTotal(calculateTotal(updated, parts));
  };

  // Parts
  const addPart = () => {
    setParts(prev => [...prev, { _id: "", description: "", price: 0, amount: 1 }]);
  };

  const updatePart = (index, partId) => {
    const part = availableParts.find(p => p._id === partId);
    if (!part) return;

    const updated = [...parts];
    updated[index] = {
      _id: part._id,
      description: part.description,
      price: Number(part.price_usd || 0),
      amount: 1
    };

    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  const updatePartAmount = (index, value) => {
    const updated = [...parts];
    const v = Number(value || 0) || 0;
    updated[index].amount = v;
    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  const removePart = (index) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
    setTotal(calculateTotal(services, updated));
  };

  return (
    <Modal title="Editar presupuesto" onClose={onClose} onConfirm={handleConfirm}>
      <div className="space-y-3">
        {/* --- SERVICES --- */}
        <h3 className="text-lg font-semibold mb-2">Servicios</h3>
        <div className="flex flex-col gap-2">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-3 items-center sm:items-center w-full"
            >
              <select
                value={s._id}
                className="border rounded px-3 py-2 w-full sm:flex-1"
                onChange={(e) => updateService(idx, e.target.value)}
              >
                <option value="">Seleccionar servicio...</option>
                {availableServices.map(srv => (
                  <option key={srv._id} value={srv._id}>
                    {srv.name} (${Number(srv.price_usd || 0).toLocaleString()})
                  </option>
                ))}
              </select>

              <div className="text-sm w-full sm:w-28 text-right">
                ${Number(s.price || 0).toLocaleString()}
              </div>

              <button className="text-red-500" onClick={() => removeService(idx)}>✖</button>
            </div>
          ))}
          <button onClick={addService} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            + Agregar servicio
          </button>
        </div>

        {/* --- PARTS --- */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Repuestos</h3>
        <div className="flex flex-col gap-2">
          {parts.map((p, idx) => {
            const selectedPart = availableParts.find(x => x._id === p._id) || {};
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-3 items-center sm:items-center w-full"
              >
                <select
                  value={p._id}
                  className="border rounded px-3 py-2 w-full sm:flex-1 truncate"
                  onChange={(e) => updatePart(idx, e.target.value)}
                >
                  <option value="">Seleccionar repuesto...</option>

                  {availableParts.map(part => (
                    <option key={part._id} value={part._id}>
                      {part.description} - ${Number(part.price_usd || 0).toLocaleString()} (stock: {part.stock})
                    </option>
                  ))}
                </select>

                <div className="w-full sm:w-20 text-sm text-right">
                  ${Number(selectedPart.price_usd || p.price || 0).toLocaleString()}
                </div>

                <input
                  type="number"
                  min="1"
                  className="border rounded px-3 py-2 w-full sm:w-20"
                  value={p.amount}
                  onChange={(e) => updatePartAmount(idx, e.target.value)}
                />

                <div className="text-xs text-gray-500 w-full sm:w-28 text-right">
                  Stock: {selectedPart.stock ?? "-"}
                </div>

                <button className="text-red-500" onClick={() => removePart(idx)}>✖</button>
              </div>
            );
          })}

          <button onClick={addPart} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">
            + Agregar repuesto
          </button>
        </div>

        <div className="mt-6 text-right">
          <p className="text-xl font-bold text-green-700">
            Total estimado (ARS): ${Number(total || 0).toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;
