import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useInventoryStore } from "../store/useInventoryStore";
import { updateBikepart as apiUpdateBikepart } from "../services/bikepartService"; // si querés actualizar stock via API en otras acciones

const EditBudgetModal = ({ budget, onClose, onSave }) => {
  const availableServices = useInventoryStore(s => s.services || []);
  const availableParts = useInventoryStore(s => s.bikeparts || []);
  const setMultipleBikepartStocks = useInventoryStore(s => s.setMultipleBikepartStocks);
  const [serviceSearchTerms, setServiceSearchTerms] = useState({});
  const [partSearchTerms, setPartSearchTerms] = useState({});

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

  // Actualizar búsqueda de servicios
  const updateServiceSearch = (index, value) => {
    setServiceSearchTerms(prev => ({
      ...prev,
      [index]: value
    }));
  };

  // Actualizar búsqueda de repuestos
  const updatePartSearch = (index, value) => {
    setPartSearchTerms(prev => ({
      ...prev,
      [index]: value
    }));
  };

  // Filtrar servicios
  const getFilteredServices = (index) => {
    const term = (serviceSearchTerms[index] || "").toLowerCase();
    const selectedIds = services.map(s => s._id);

    if (term.length < 2) return [];

    return availableServices
      .filter(s =>
        !selectedIds.includes(s._id) &&
        (s.name.toLowerCase().includes(term) ||
        (s.description || "").toLowerCase().includes(term))
      )
      .slice(0, 8);
  };

  // Filtrar repuestos
  const getFilteredParts = (index) => {
    const term = (partSearchTerms[index] || "").toLowerCase();
    const selectedIds = parts.map(p => p._id);

    if (term.length < 2) return [];

    return availableParts
      .filter(p =>
        !selectedIds.includes(p._id) &&
        (
          (p.description || "").toLowerCase().includes(term) ||
          (p.code || "").toLowerCase().includes(term)
        )
      )
      .slice(0, 8);
  };

  return (
    <Modal title="Editar presupuesto" onClose={onClose} onConfirm={handleConfirm}>
      <div className="space-y-3">
        {/* --- SERVICES --- */}
        <h3 className="text-lg font-semibold mb-2">Servicios</h3>
        <div className="flex flex-col gap-2">
          {services.map((s, idx) => {
            const subtotal = Number(s.price || 0);

            return (
              <div
                key={idx}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              > 
                <div>
                  <label className="font-medium text-sm text-gray-700">
                    Servicio
                  </label>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => removeService(idx)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar servicio..."
                    value={
                      services[idx]?._id
                        ? services[idx].name
                        : serviceSearchTerms[idx] || ""
                    }
                    onChange={(e) => {
                      updateServiceSearch(idx, e.target.value);
                      // Si empieza a escribir de nuevo, limpiar selección
                      if (services[idx]?._id) {
                        const updated = [...services];
                        updated[idx] = { _id: "", name: "", price: 0 };
                        setServices(updated);
                      }
                    }}
                    className="border rounded px-3 py-2 w-full"
                  />

                  {/* Dropdown resultados */}
                  {getFilteredServices(idx).length > 0 && !services[idx]?._id && (
                    <div className="absolute z-10 bg-white border rounded shadow-md mt-1 w-full max-h-48 overflow-auto">
                      {getFilteredServices(idx).map(srv => (
                        <div
                          key={srv._id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            updateService(idx, srv._id);
                            setServiceSearchTerms(prev => ({
                              ...prev,
                              [idx]: ""
                            }));
                          }}
                        >
                          <div className="font-medium">{srv.name}</div>
                          <div className="text-xs text-gray-500">
                            ${Number(srv.price_usd || 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span>Precio:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
          <button onClick={addService} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            + Agregar servicio
          </button>
        </div>

        {/* --- PARTS --- */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Repuestos</h3>
        <div className="flex flex-col gap-2">
          {parts.map((p, idx) => {
            const selectedPart = availableParts.find(x => x._id === p._id) || {};
            const unitPrice = Number(selectedPart.price_usd || p.price || 0);
            const subtotal = unitPrice * Number(p.amount || 0);

            return (
              <div
                key={idx}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm text-gray-700">
                    Repuesto
                  </label>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => removePart(idx)}
                  >
                    Eliminar
                  </button>
                </div>
            
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por código o descripción..."
                    value={
                      parts[idx]?._id
                        ? `${selectedPart.code || ""} - ${selectedPart.description || ""}`
                        : partSearchTerms[idx] || ""
                    }
                    onChange={(e) => {
                      updatePartSearch(idx, e.target.value);
                    
                      // Si empieza a escribir, limpiar selección previa
                      if (parts[idx]?._id) {
                        const updated = [...parts];
                        updated[idx] = { _id: "", description: "", price: 0, amount: 1 };
                        setParts(updated);
                      }
                    }}
                    className="border rounded px-3 py-2 w-full"
                  />

                  {/* Dropdown resultados */}
                  {getFilteredParts(idx).length > 0 && !parts[idx]?._id && (
                    <div className="absolute z-10 bg-white border rounded shadow-md mt-1 w-full max-h-48 overflow-auto">
                      {getFilteredParts(idx).map(part => (
                        <div
                          key={part._id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            updatePart(idx, part._id);
                            setPartSearchTerms(prev => ({
                              ...prev,
                              [idx]: ""
                            }));
                          }}
                        >
                          <div className="font-medium">
                            {part.code} — {part.description}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {part.stock} | ${Number(part.price_usd || 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Precio unitario:</span>
                  <span>${unitPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Cantidad:</span>
                  <input
                    type="number"
                    min="1"
                    className="border rounded px-2 py-1 w-20 text-right"
                    value={p.amount}
                    onChange={(e) => updatePartAmount(idx, e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  Stock disponible: {selectedPart.stock ?? "-"}
                </div>
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
