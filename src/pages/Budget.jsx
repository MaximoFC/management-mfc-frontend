import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchServices } from "../services/serviceService";
import { fetchBikeparts } from "../services/bikepartService";
import BudgetModal from "../components/BudgetModal";
import AddServiceModal from "../components/AddServiceModal";
import { fetchDollarRate } from "../services/utilsService";
import WarrantyMatchModal from "../components/WarrantyMatchModal";
import { getActiveWarranties } from "../services/warrantyService";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";
import axios from "axios";

const Budget = () => {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bikeparts, setBikeparts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBikeparts, setSelectedBikeparts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [dollarRate, setDollarRate] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [bikeId, setBikeId] = useState(null);
  const [warrantyMatches, setWarrantyMatches] = useState([]);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [coveredServices, setCoveredServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [bikes, setBikes] = useState([]);

  const handleConfirmBudget = async () => {
    try {
      await axios.post("http://localhost:4000/api/budgets", {
        bike_id: bikeId,
        employee_id: clientId,
        services: selectedServices.map(id => ({
          service_id: id,
        })),
        bikeparts: selectedBikeparts.map(bp => ({
          bikepart_id: bp.bikepart_id,
          amount: bp.amount,
        })),
        applyWarranty: coveredServices,
      });


      alert("Presupuesto generado con éxito ✅");
      setShowModal(false);
      setSelectedServices([]);
      setSelectedBikeparts([]);
      setCoveredServices([]);
    } catch (err) {
      console.error(err);
      alert("Error al generar el presupuesto ❌");
    }
  };

  const checkWarrantyMatch = async () => {
    if (!clientId || !bikeId || selectedServices.length === 0) return;

    try {
      const warranties = await getActiveWarranties(clientId, bikeId);
      const coveredIds = warranties.map(w => w.serviceId);
      
      const matches = selectedServices
        .filter(id => coveredIds.includes(id))
        .map(id => {
          const warranty = warranties.find(w => w.serviceId === id);
          return {
          serviceId: id,
          name: services.find(s => s._id === id).name,
          endDate: warranty?.endDate
        }
        });


      if (matches.length > 0) {
        setWarrantyMatches(matches);
        setShowWarrantyModal(true);
      }
    } catch (err) {
      console.error("Error al verificar garantías:", err);
    }
  };

  useEffect(() => {
    fetchServices().then(setServices);
    fetchBikeparts().then(setBikeparts);
    fetchDollarRate()
      .then((rate) => setDollarRate(rate))
      .catch(() => setDollarRate(0));
    fetchClients().then(setClients);
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchBikesByClient(clientId).then(setBikes);
    } else {
      setBikes([]);
      setBikeId(null);
    }
  }, [clientId]);

  const handleGenerateBudget = () => {
  // Solo verificamos garantías aquí, al generar presupuesto
  if (!clientId || !bikeId) {
    alert("Seleccione cliente y bicicleta");
    return;
  }

  getActiveWarranties(clientId, bikeId).then((warranties) => {
    const coveredIds = warranties.map(w => w.serviceId);
    const matches = selectedServices
      .filter(id => coveredIds.includes(id))
      .map(id => {
        const warranty = warranties.find(w => w.serviceId === id);
        const service = services.find(s => s._id === id);
        return {
          serviceId: id,
          name: service?.name,
          endDate: warranty?.endDate
        };
      });

    if (matches.length > 0) {
      setWarrantyMatches(matches);
      setShowWarrantyModal(true); // ✅ ahora solo aparece una vez
    } else {
      setShowModal(true);
    }
  });
};

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
    .reduce((acc, s) => {
      const isCovered = coveredServices.includes(s._id);
      return acc + (isCovered ? 0 : Number(s.price_usd));
  }, 0);

  const totalBikepartsUSD = selectedBikeparts.reduce((acc, item) => {
    const part = bikeparts.find((p) => p._id === item.bikepart_id);
    return part ? acc + Number(part.price_usd) * item.amount : acc;
  }, 0);

  const totalBudgetUSD = totalBikepartsUSD + totalServicesUSD;
  const totalBudgetARS = totalBudgetUSD * (dollarRate ?? 0);

  const handleDownloadPdf = async () => {
    const budgetData = {
      name: 'Mecánica Facundo Callejas',
      address: 'Paraguay 1674, Yerba Buena',
      mobileNum: '+54 9 381 547-5600',
      items: [
        ...services
          .filter(s => selectedServices.includes(s._id))
          .map(s => ({
            name: s.name,
            qty: 1,
            price: Number(s.price_usd) * (dollarRate ?? 0)
          })),

        ...selectedBikeparts.map(bp => {
          const part = bikeparts.find(p => p._id === bp.bikepart_id);
          return {
            name: part?.description || "Repuesto",
            qty: bp.amount,
            price: Number(part?.price_usd || 0) * (dollarRate ?? 0)
          };
        })
      ],
      total: totalBudgetARS
    };

    const response = await fetch("http://localhost:4000/api/budgets/generate-pdf", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      alert("Error generando PDF");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "presupuesto.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-6 bg-white border border-gray-200 rounded-md p-4 md:p-6">

          <div className="flex gap-4">
            <select
              className="border p-2 rounded flex-1"
              value={clientId || ""}
              onChange={e => setClientId(e.target.value)}
            >
              <option value="">-- Seleccioná cliente --</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.surname}
                  </option>
                ))}
            </select>

            <select
              className="border p-2 rounded flex-1"
              value={bikeId || ""}
              onChange={e => setBikeId(e.target.value)}
              disabled={!clientId}
            >
              <option value="">-- Seleccioná bici --</option>
                {bikes.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.brand} {b.model}
                  </option>
                ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold">Crear presupuesto</h2>

          {/* Tabs y botón, column en móvil, fila en md */}
          <div className="flex flex-wrap md:flex-nowrap gap-4 items-stretch mb-4 w-full">
            <div className="flex-1 flex gap-2 min-w-[250px]">
              <button
                className={`cursor-pointer flex-1 px-4 py-2 rounded-md text-sm sm:text-base font-semibold ${
                  tab === "services" ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setTab("services")}
              >
                Servicios
              </button>
              <button
                className={`cursor-pointer flex-1 px-4 py-2 rounded-md text-sm sm:text-base font-semibold ${
                  tab === "parts" ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setTab("parts")}
              >
                Repuestos
              </button>
            </div>

            <div className="w-full md:w-auto">
              <button
                className="cursor-pointer bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full md:w-auto"
                onClick={() => setShowAddService(true)}
              >
                + Agregar servicio
              </button>
            </div>
          </div>

          {/* Tabla con scroll horizontal */}
          <div className="overflow-x-auto">
            {tab === "services" && (
              <table className="w-full min-w-[600px] bg-white">
                <thead className="text-gray-500 border border-gray-300">
                  <tr>
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Descripción</th>
                    <th className="px-4 py-2 text-left">Costo (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr
                      key={s._id}
                      className={`border-t border-gray-200 h-16 ${
                        warrantyMatches.some(w => w.serviceId === s._id)
                        ? "bg-green-100"
                        : "hover:bg-gray-50"
                      }`}
                    >
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
              <table className="w-full min-w-[800px] bg-white">
                <thead className="text-gray-500 border border-gray-300">
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
                      const selected = selectedBikeparts.find(
                        (item) => item.bikepart_id === p._id
                      );
                      return (
                        <tr
                          key={p._id}
                          className="border-t border-gray-200 hover:bg-gray-50 h-16"
                        >
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
                          <td className="py-3 px-6">${p.price_usd}</td>
                          <td className="py-3 px-6">
                            {selected && (
                              <input
                                type="number"
                                min="1"
                                max={p.stock}
                                className="w-16 border rounded px-2 py-1"
                                value={selected.amount}
                                onChange={(e) =>
                                  updateBikepartAmount(p._id, e.target.value)
                                }
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-right text-gray-500 text-sm md:text-base mt-2">
            * Los precios de los servicios y repuestos están expresados en USD - Cotización
            actual: {dollarRate === null ? "Cargando cotización..." : `$${dollarRate}`}
          </p>
        </div>

        {/* Resumen y botón */}
        <div className="flex flex-col md:flex-col lg:flex-row gap-6 justify-center lg:justify-between items-center mt-10 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto justify-center md:justify-start">
            <div className="border border-gray-300 rounded-md py-4 px-6 bg-white text-center md:text-left">
              <p className="text-md mb-2 font-semibold">
                Servicios seleccionados: {selectedServices.length}
              </p>
              <p className="text-sm mb-2 font-semibold text-gray-500">
                Total Servicios (USD)
              </p>
              <p className="text-2xl font-bold text-green-500">
                ${totalServicesUSD.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="border border-gray-300 rounded-md py-4 px-6 bg-white text-center md:text-left">
              <p className="text-md mb-2 font-semibold">
                Repuestos seleccionados: {selectedBikeparts.length}
              </p>
              <p className="text-sm mb-2 font-semibold text-gray-500">
                Total Repuestos (USD)
              </p>
              <p className="text-2xl font-bold text-blue-500">
                ${totalBikepartsUSD.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="border border-gray-300 rounded-md py-4 px-6 bg-white text-center md:text-left">
              <p className="text-sm mb-2 font-semibold text-gray-500">
                Total Presupuesto (ARS)
              </p>
              <p className="text-2xl font-bold text-purple-500">
                ${totalBudgetARS.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-md cursor-pointer w-full md:w-auto"
            onClick={handleDownloadPdf}
          >
            Generar PDF
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white p-3 rounded-md cursor-pointer w-full md:w-auto"
            onClick={handleGenerateBudget}
          >
            Generar presupuesto
          </button>
        </div>

        {showWarrantyModal && (
          <WarrantyMatchModal
            warranties={warrantyMatches}
            onApply={selectedIds => {
              setCoveredServices(selectedIds);
              setShowWarrantyModal(false);
              setShowModal(true);
            }}
            onCancel={() => {
              setCoveredServices([]);
              setShowWarrantyModal(false);
              setShowModal(true);
            }}
          />
        )}

        {showModal && (
          <BudgetModal
            closeModal={() => setShowModal(false)}
            selectedServices={services
              .filter(s => selectedServices.includes(s._id))
              .map(s => ({
                service_id: s._id,
                name: s.name,
                price: Number(s.price_usd),
                covered: coveredServices.includes(s._id),
              }))
            }
            selectedBikeparts={selectedBikeparts.map(bp => {
              const part = bikeparts.find(p => p._id === bp.bikepart_id);
              return {
                bikepart_id: bp.bikepart_id,
                name: part?.description || "Repuesto",
                price: Number(part?.price_usd || 0),
                amount: bp.amount,
              };
            })}
            totalUSD={totalBudgetUSD}
            onConfirm={handleConfirmBudget}
          />
        )}


        {showAddService && (
          <AddServiceModal
            onClose={() => setShowAddService(false)}
            onSuccess={(newService) => {
              setServices((prev) => [...prev, newService]);
              setShowAddService(false);
            }}
          />
        )}

        

      </div>
    </Layout>
  );
};

export default Budget;
