import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchServices } from "../services/serviceService";
import { fetchBikeparts } from "../services/bikepartService";
import BudgetModal from "../components/BudgetModal";
import AddServiceModal from "../components/AddServiceModal";
import { fetchDollarRate } from "../services/utilsService";

const Budget = () => {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bikeparts, setBikeparts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBikeparts, setSelectedBikeparts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [dollarRate, setDollarRate] = useState(null);

  useEffect(() => {
    fetchServices().then(setServices);
    fetchBikeparts().then(setBikeparts);
    fetchDollarRate()
      .then(rate => setDollarRate(rate))
      .catch(() => setDollarRate(0));
  }, []);

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleBikepart = (id) => {
    setSelectedBikeparts((prev) => {
      const exists = prev.find((item) => item.bikepart_id === id);
      if (exists) {
        return prev.filter((item) => item.bikepart_id !== id);
      } else {
        return [...prev, { bikepart_id: id, amount: 1 }];
      }
    });
  };

  const updateBikepartAmount = (id, amount) => {
    setSelectedBikeparts((prev) =>
      prev.map((item) => {
        if (item.bikepart_id === id) {
          const part = bikeparts.find((p) => p._id === id);
          const max = part?.stock ?? Infinity;
          const safeAmount = Math.min(Number(amount), max);
          return { ...item, amount: safeAmount };
        }
        return item;
      })
    );
  };

  const totalServicesUSD = services
    .filter((s) => selectedServices.includes(s._id))
    .reduce((acc, s) => acc + Number(s.price_usd), 0);

  const totalBikepartsARS = selectedBikeparts.reduce((acc, item) => {
    const part = bikeparts.find((p) => p._id === item.bikepart_id);
    return part ? acc + part.price * item.amount : acc;
  }, 0);

  const totalBudgetARS = totalBikepartsARS + totalServicesUSD * ( dollarRate ?? 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 bg-white border-1 border-gray-200 rounded-md p-8">
          <h2 className="text-2xl font-bold">Crear presupuesto</h2>

          <div className="flex gap-4 mb-4 items-center">
            <div className="w-2/3 flex justify-around gap-2">
              <button
                className={`cursor-pointer w-1/2 px-6 py-3 rounded-md text-lg font-semibold ${tab === "services" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                onClick={() => setTab("services")}
              >
                Servicios
              </button>
              <button
                className={`cursor-pointer w-1/2 px-6 py-3 rounded-md text-lg font-semibold ${tab === "parts" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                onClick={() => setTab("parts")}
              >
                Repuestos
              </button>
            </div>

            <button
              className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md cursor-pointer"
              onClick={() => setShowAddService(true)}
              style={{ marginLeft: "auto" }}
            >
              + Agregar servicio
            </button>
          </div>

          {tab === "services" && (
            <table className="w-full bg-white">
              <thead className="text-gray-500 border-1 border-gray-300">
                <tr>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Descripción</th>
                  <th className="px-4 py-2 text-left">Costo (USD)</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id} className="border-t border-gray-200 hover:bg-gray-50 h-16">
                    <td className="py-3 px-6">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s._id)}
                        onChange={() => toggleService(s._id)}
                      />
                    </td>
                    <td className="py-3 px-6">{s.name}</td>
                    <td className="py-3 px-6">{s.description}</td>
                    <td className="py-3 px-6">${s.price_usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "parts" && (
            <table className="w-full bg-white">
              <thead className="text-gray-500 border-1 border-gray-300">
                <tr>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Marca</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Descripción</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Precio ($)</th>
                  <th className="px-4 py-2 text-left">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {bikeparts
                  .filter((p) => p.stock > 0)
                  .map((p) => {
                    const selected = selectedBikeparts.find((item) => item.bikepart_id === p._id);
                    return (
                      <tr key={p._id} className="border-t border-gray-200 hover:bg-gray-50 h-16">
                        <td className="py-3 px-6">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => toggleBikepart(p._id)}
                          />
                        </td>
                        <td className="py-3 px-6">{p.code}</td>
                        <td className="py-3 px-6">{p.brand}</td>
                        <td className="py-3 px-6">{p.type}</td>
                        <td className="py-3 px-6">{p.description}</td>
                        <td className="py-3 px-6">{p.stock}</td>
                        <td className="py-3 px-6">${p.price}</td>
                        <td className="py-3 px-6">
                          {selected && (
                            <input
                              type="number"
                              min="1"
                              max={p.stock}
                              className="w-16 border rounded px-2 py-1"
                              value={selected.amount}
                              onChange={(e) => updateBikepartAmount(p._id, e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          )}
          <p className="text-right text-gray-500">
            * Los precios de los servicios están expresados en USD - Cotización actual: <br /> 
            {dollarRate === null 
              ? "Cargando cotización..."
              : `$${dollarRate}`
            }
          </p>
        </div>

        {/* Resumen y botón */}
        <div className="flex flex-col justify-between items-center mt-10 gap-6">
          <div className="flex gap-6 w-full justify-between">
            <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
              <p className="text-md mb-2 font-semibold">Servicios seleccionados: {selectedServices.length}</p>
              <p className="text-sm mb-2 font-semibold text-gray-500">Total Servicios (USD)</p>
              <p className="text-2xl font-bold text-green-500">${totalServicesUSD.toFixed(2)}</p>
            </div>
            <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
              <p className="text-md mb-2 font-semibold">Repuestos seleccionados: {selectedBikeparts.length}</p>
              <p className="text-sm mb-2 font-semibold text-gray-500">Total Repuestos (ARS)</p>
              <p className="text-2xl font-bold text-blue-500">${totalBikepartsARS.toFixed(2)}</p>
            </div>
            <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
              <p className="text-sm mb-2 font-semibold text-gray-500">Total Presupuesto (ARS)</p>
              <p className="text-2xl font-bold text-purple-500">${totalBudgetARS.toFixed(2)}</p>
            </div>
          </div>

          <button
            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Generar presupuesto
          </button>
        </div>

        {showModal && (
          <BudgetModal
            closeModal={() => setShowModal(false)}
            selectedServices={selectedServices.map(id => ({ service_id: id }))}
            selectedBikeparts={selectedBikeparts}
          />
        )}

        {showAddService && (
          <AddServiceModal
            onClose={() => setShowAddService(false)}
            onSuccess={(newService) => {
              setServices(prev => [...prev, newService]);
              setShowAddService(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Budget;
