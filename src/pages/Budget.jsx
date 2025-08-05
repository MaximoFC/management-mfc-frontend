import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchServices } from "../services/serviceService";
import { fetchBikeparts } from "../services/bikepartService";
import BudgetModal from "../components/BudgetModal";
import AddServiceModal from "../components/AddServiceModal";

const Budget = () => {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bikeparts, setBikeparts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBikeparts, setSelectedBikeparts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  useEffect(() => {
    fetchServices().then(setServices);
    fetchBikeparts().then(setBikeparts);
  }, []);

  // (des)Seleccion de servicios
  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // (des)Seleccion de partes
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
      prev.map((item) =>
        item.bikepart_id === id ? { ...item, amount: Number(amount) } : item
      )
    );
  };

  // Calculo Totales
  const totalServices = services
    .filter((s) => selectedServices.includes(s._id))
    .reduce((acc, s) => acc + Number(s.price_usd), 0);

  const totalBikeparts = bikeparts
    .filter((p) => selectedBikeparts.includes(p._id))
    .reduce((acc, p) => acc + Number(p.price), 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Presupuestos</h2>
        {/* Los Tabs*/}
        <div className="flex gap-4 mb-4 items-center">
          <button
            className={`px-6 py-3 rounded-t-lg text-lg font-semibold ${tab === "services" ? "bg-red-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab("services")}
          >
            Servicios
          </button>
          <button
            className={`px-6 py-3 rounded-t-lg text-lg font-semibold ${tab === "parts" ? "bg-red-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab("parts")}
          >
            Partes
          </button>
          <button
            className="ml-auto px-6 py-3 rounded-lg text-lg font-semibold bg-red-600 text-white shadow hover:bg-red-700 transition"
            onClick={() => setShowAddService(true)}
            style={{ marginLeft: "auto" }}
          >
            + Agregar servicio
          </button>
        </div>

        {/* Tablas */}
        {tab === "services" && (
          <div className="bg-white rounded-b-lg shadow p-6">
            <table className="w-full text-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 text-left">Nombre</th>
                  <th className="py-4 px-6 text-left">Descripción</th>
                  <th className="py-4 px-6 text-left">Costo (USD)</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr
                    key={s._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer h-16 ${selectedServices.includes(s._id) ? "bg-green-50" : ""}`}
                    onClick={() => toggleService(s._id)}
                  >
                    <td className="py-3 px-6">{s.name}</td>
                    <td className="py-3 px-6">{s.description}</td>
                    <td className="py-3 px-6">${s.price_usd}</td>
                    <td className="py-3 px-6">
                      {selectedServices.includes(s._id) && (
                        <span className="inline-block bg-green-500 rounded-full w-5 h-5 border-2 border-green-600 shadow"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-right text-base text-gray-500">* Los precios de servicios están expresados en dólares (USD).</p>
          </div>
        )}

        {tab === "parts" && (
          <div className="bg-white rounded-b-lg shadow p-6">
            <table className="w-full text-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 text-left">Marca</th>
                  <th className="py-4 px-6 text-left">Tipo</th>
                  <th className="py-4 px-6 text-left">Descripción</th>
                  <th className="py-4 px-6 text-left">Stock</th>
                  <th className="py-4 px-6 text-left">Precio ($)</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {bikeparts.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer h-16 ${selectedBikeparts.includes(p._id) ? "bg-green-50" : ""}`}
                    onClick={() => toggleBikepart(p._id)}
                  >
                    <td className="py-3 px-6">{p.brand}</td>
                    <td className="py-3 px-6">{p.type}</td>
                    <td className="py-3 px-6">{p.description}</td>
                    <td className="py-3 px-6">{p.stock}</td>
                    <td className="py-3 px-6">${p.price}</td>
                    <td className="py-3 px-6">
                      {selectedBikeparts.find((item) => item.bikepart_id === p._id) && (
                        <input
                          type="number"
                          min="1"
                          className="w-16 border rounded px-2 py-1"
                          value={
                            selectedBikeparts.find((item) => item.bikepart_id === p._id)?.amount || 1
                          }
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateBikepartAmount(p._id, e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-right text-base text-gray-500">* Los precios de partes están expresados en pesos argentinos.</p>
          </div>
        )}

        {/* Resumen y botón */}
        <div className="flex justify-between items-center mt-10">
          <div className="flex gap-6">
            <div className="bg-gray-100 rounded-lg p-6 shadow text-center min-w-[200px]">
              <div className="text-sm text-gray-500 mb-2 font-semibold">Total Servicios (USD)</div>
              <div className="text-2xl font-bold">${totalServices}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 shadow text-center min-w-[200px]">
              <div className="text-sm text-gray-500 mb-2 font-semibold">Total Partes (Pesos)</div>
              <div className="text-2xl font-bold">${totalBikeparts}</div>
            </div>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-lg shadow font-bold text-lg"
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

        {/* MODAL AGREGAR SERVICIO */}
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
