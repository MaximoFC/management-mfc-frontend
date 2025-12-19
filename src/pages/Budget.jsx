import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import BudgetModal from "../components/BudgetModal";
import AddServiceModal from "../components/AddServiceModal";
import { fetchDollarRate } from "../services/utilsService";
import WarrantyMatchModal from "../components/WarrantyMatchModal";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";
import { createBudget, getActiveWarranties, generateBudgetPdf } from "../services/budgetService";
import Select from "react-select";
import { toast } from "react-toastify";
import { SPARE_TYPES } from "../constants/spareTypes";
import { useInventoryStore } from "../store/useInventoryStore";

const ITEMS_PER_PAGE = 10;

const Budget = () => {
  const allServices = useInventoryStore(state => state.services || []);
  const addServiceLocal = useInventoryStore(state => state.addServiceLocal);
  const globalBikeparts = useInventoryStore(state => state.bikeparts || []);
  const [bikeparts, setBikeparts] = useState(globalBikeparts);

  const [tab, setTab] = useState("services");

  // Search-visible list
  const [serviceResults, setServiceResults] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [serviceTotalPages, setServiceTotalPages] = useState(1);

  // Persistente: servicios seleccionados
  const [selectedServices, setSelectedServices] = useState([]);

  // Repuestos
  const [selectedBikeparts, setSelectedBikeparts] = useState([]);

  // UI / modales
  const [showModal, setShowModal] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyMatches, setWarrantyMatches] = useState([]);
  const [coveredServices, setCoveredServices] = useState([]); // array de ids

  // Meta datos
  const [dollarRate, setDollarRate] = useState(null);
  const [clients, setClients] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [bikeId, setBikeId] = useState(null);

  // Parts search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Carga de datos iniciales: dólar y clientes
  useEffect(() => {
    let mounted = true;
    fetchDollarRate()
      .then((r) => mounted && setDollarRate(r))
      .catch(() => mounted && setDollarRate(0));

    fetchClients().then(res => {
      if (mounted) setClients(Array.isArray(res) ? res: []);
    }).catch(err => {
      console.error("Error fetch clients: ", err);
    });

    return () => { mounted = false; };
  }, []);

  // Bicis por cliente
  useEffect(() => {
    if (!clientId) {
      setBikes([]);
      setBikeId(null);
      return;
    }
    let mounted = true;
    fetchBikesByClient(clientId).then(res => {
      if (mounted) setBikes(Array.isArray(res) ? res : []);
    }).catch(err => console.error("Error fetching bikes: ", err));
    return () => { mounted = false };
  }, [clientId]);

  // Sincronizar bikeparts con store global cuando no hay búsqueda activa
  useEffect(() => {
    if ((searchTerm?.trim()?.length ?? 0) < 2 && !selectedCategory) {
      setBikeparts(globalBikeparts || []);
    }
  }, [globalBikeparts, searchTerm, selectedCategory]);

  // Bikeparts search
  useEffect(() => {
    const all = globalBikeparts || [];

    if (searchTerm.length < 2 && !selectedCategory) {
      setBikeparts(all);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = all.filter(p => {
      const inText = 
        p.description.toLowerCase().includes(term) || 
        p.brand.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term);

      const inCategory = 
        !selectedCategory || p.type === selectedCategory;

      return inText && inCategory;
    });

    setBikeparts(filtered);
  }, [searchTerm, selectedCategory, globalBikeparts]);

  // Búsqueda local de servicios (usa el store global)
  useEffect(() => {
    if (! serviceSearch || serviceSearch.trim().length < 2) {
      setServiceResults([]);
      setServiceTotalPages(1);
      setServicePage(1);
      return;
    }

    const lower = serviceSearch.trim().toLowerCase();

    const filtered = (allServices || []).filter(s => {
      const name = (s.name || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      return name.includes(lower) || desc.includes(lower);
    });

    const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setServiceTotalPages(pages);
    setServicePage(1);
    setServiceResults(filtered);
  }, [serviceSearch, allServices]);

  // serviceResultsPage: items a mostrar en la tabla de búsqueda
  const serviceResultsPage = useMemo(() => {
    const start = (servicePage - 1) * ITEMS_PER_PAGE;
    return serviceResults.slice(start, start + ITEMS_PER_PAGE);
  }, [serviceResults, servicePage]);

  const isServiceSelected = (id) => selectedServices.some(s => s._id === id);

  const selectService = (service) => {
    setSelectedServices(prev => {
      if (prev.some(s => s._id === service._id)) return prev;
      return [...prev, service];
    });
  };

  const unselectServiceById = (id) => {
    setSelectedServices(prev => prev.filter(s => s._id !== id));
    setCoveredServices(prev => prev.filter(x => x !== id));
  };

  const toggleService = (service) => {
    if (!service) return;
    if (isServiceSelected(service._id)) {
      unselectServiceById(service._id);
    } else {
      selectService(service);
    }
  };

  // Helpers para bikeparts
  const toggleBikepart = (id) => {
    setSelectedBikeparts(prev => {
      const exists = prev.find(item => item.bikepart_id === id);
      if (exists) return prev.filter(item => item.bikepart_id !== id);
      return [...prev, { bikepart_id: id, amount: 1 }];
    });
  };

  const updateBikepartAmount = (id, amount) => {
    setSelectedBikeparts(prev =>
      prev.map(item => item.bikepart_id === id ? { ...item, amount: Math.max(1, Number(amount) || 1) } : item)
    );
  };

  const removeSelectedBikepart = (id) => {
    setSelectedBikeparts(prev => prev.filter(item => item.bikepart_id !== id));
  };

  // Totales calculados siempre desde selectedServices / selectedBikeparts
  const totalServicesUSD = useMemo(() => {
    return selectedServices.reduce((acc, s) => {
      const covered = coveredServices.includes(s._id);
      return acc + (covered ? 0 : Number(s.price_usd || 0));
    }, 0);
  }, [selectedServices, coveredServices]);

  const totalBikepartsUSD = useMemo(() => {
    return selectedBikeparts.reduce((acc, item) => {
      const part = bikeparts.find(p => p._id === item.bikepart_id) || {};
      return acc + (Number(part.price_usd || 0) * Number(item.amount || 0));
    }, 0);
  }, [selectedBikeparts, bikeparts]);

  const totalBudgetUSD = totalServicesUSD + totalBikepartsUSD;
  const totalBudgetARS = totalBudgetUSD * (dollarRate ?? 0);

  // GENERAR PDF
  const handleDownloadPdf = async () => {
    const items = [
      ...selectedServices.map(s => ({
        type: "service",
        name: s.name,
        qty: 1,
        price: Number(s.price_usd || 0) * (dollarRate ?? 0),
      })),
      ...selectedBikeparts.map(bp => {
        const part = bikeparts.find(p => p._id === bp.bikepart_id);
        return {
          type: "part",
          name: part?.description || "Repuesto",
          qty: bp.amount,
          price: Number(part?.price_usd || 0) * (dollarRate ?? 0),
        };
      })
    ];

    const budgetData = {
      name: 'Mecánica Facundo Callejas',
      address: 'Paraguay 1674, Yerba Buena',
      mobileNum: '+54 9 381 547-5600',
      items,
      total: totalBudgetARS
    };

    try {
      const blob = await generateBudgetPdf(budgetData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "presupuesto.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Error generando PDF");
    }
  };

  // CREAR PRESUPUESTO (usa selectedServices / selectedBikeparts)
  const handleConfirmBudget = async () => {
    if (!clientId || !bikeId) {
      toast.warning("Seleccione cliente y bicicleta");
      return;
    }

    try {
      const payload = {
        bike_id: bikeId,
        employee_id: clientId,
        services: selectedServices.map(s => ({ service_id: s._id })),
        bikeparts: selectedBikeparts.map(bp => ({ bikepart_id: bp.bikepart_id, amount: bp.amount })),
        applyWarranty: coveredServices
      };

      await createBudget(payload);
      toast.success("Presupuesto generado con éxito");
      setSelectedServices([]);
      setSelectedBikeparts([]);
      setCoveredServices([]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el presupuesto");
    }
  };

  // GENERAR presupuesto: chequeo de garantías antes
  const handleGenerateBudget = () => {
    if (!clientId || !bikeId) {
      toast.warning("Seleccione cliente y bicicleta");
      return;
    }

    getActiveWarranties(clientId, bikeId).then((warranties) => {
      const activeServices = warranties.flatMap(b =>
        b.services
          .filter(s => s.warranty?.status === "activa")
          .map(s => ({
            serviceId: String(s.service_id._id || s.service_id),
            endDate: s.warranty.endDate
          }))
      );

      const coveredIds = activeServices.map(s => s.serviceId);

      const matches = selectedServices
        .map(s => s._id)
        .filter(id => coveredIds.includes(id))
        .map(id => {
          const service = selectedServices.find(ss => ss._id === id);
          const warranty = activeServices.find(w => w.serviceId === id);
          return {
            serviceId: id,
            name: service?.name,
            endDate: warranty?.endDate
          };
        });

      if (matches.length > 0) {
        setWarrantyMatches(matches);
        setShowWarrantyModal(true);
      } else {
        setShowModal(true);
      }
    }).catch(err => {
      console.error("Error checking warranties: ", err);
      toast.error("Error verificando garantías");
    });
  };

  // AddServiceModal -> onSuccess: agregar a resultados visible y opcion de seleccionar
  const handleAddServiceSuccess = (newService) => {
    addServiceLocal(newService);
    setServiceResults(prev => [newService, ...prev]);
    setSelectedServices(prev => [newService, ...prev]);
    setShowAddService(false);
    toast.success("Servicio agregado");
  };

  const clientOptions = clients.map(c => ({ value: c._id, label: `${c.name} ${c.surname}` }));

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-6 bg-white border border-gray-200 rounded-md p-4 md:p-6">
          <div className="flex gap-4">
            <Select
              options={clientOptions}
              value={clientOptions.find(opt => opt.value === clientId) || null}
              onChange={(selected) => setClientId(selected?.value || null)}
              placeholder="Seleccioná cliente"
              isClearable
              isSearchable
              className="w-full"
            />

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

          <div className="flex flex-wrap md:flex-nowrap gap-4 items-stretch mb-4 w-full">
            <div className="flex-1 flex gap-2 min-w-[250px]">
              <button
                className={`cursor-pointer flex-1 px-4 py-2 rounded-md text-sm sm:text-base font-semibold ${tab === "services" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                onClick={() => setTab("services")}
              >
                Servicios
              </button>
              <button
                className={`cursor-pointer flex-1 px-4 py-2 rounded-md text-sm sm:text-base font-semibold ${tab === "parts" ? "bg-red-500 text-white" : "bg-gray-200"}`}
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

          {/* ---------------------- SERVICES TAB ---------------------- */}
          <div className="overflow-x-auto">
            <div className="grid md:grid-cols-2 gap-4">
  
              {/* ---- COLUMNA IZQUIERDA (depende del tab) ---- */}
              <div>
                {tab === "services" && (
                  <>
                    {/* Búsqueda de servicios */}
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Buscar servicio (mín. 2 caracteres)..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      />
                    </div>

                    {/* Tabla servicios */}
                    <div className="bg-white border rounded-md p-2">
                      <h3 className="font-semibold mb-2">Resultados</h3>
                      <div className="overflow-auto max-h-80">
                        <table className="w-full">
                          <thead>
                            <tr className="text-gray-500 text-left">
                              <th></th>
                              <th>Nombre</th>
                              <th>Descripción</th>
                              <th>Costo (USD)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceResultsPage.map(s => (
                              <tr key={s._id} className="border-t h-14">
                                <td className="px-2">
                                  <input
                                    type="checkbox"
                                    checked={isServiceSelected(s._id)}
                                    onChange={() => toggleService(s)}
                                  />
                                </td>
                                <td className="px-2">{s.name}</td>
                                <td className="px-2 text-sm text-gray-600">{s.description}</td>
                                <td className="px-2">{s.price_usd}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {tab === "parts" && (
                  <>
                    {/* Filtro repuestos */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                      />
                      <select
                        className="border border-gray-300 rounded-md px-3 py-2"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">Todas las categorías</option>
                        {SPARE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                
                    {/* Tabla repuestos */}
                    <div className="bg-white border rounded-md p-2">
                      <h3 className="font-semibold mb-2">Resultados</h3>
                      <div className="overflow-auto max-h-80">
                        <table className="w-full">
                          <thead>
                            <tr className="text-gray-500 text-left">
                              <th></th>
                              <th>Código</th>
                              <th>Marca</th>
                              <th>Tipo</th>
                              <th>Descripción</th>
                              <th>Stock</th>
                              <th>Precio ($)</th>
                              <th>Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bikeparts.filter(p => p.stock > 0).map(p => {
                              const selected = selectedBikeparts.find(item => item.bikepart_id === p._id);
                              return (
                                <tr key={p._id} className="border-t h-14">
                                  <td><input type="checkbox" checked={!!selected} onChange={() => toggleBikepart(p._id)} /></td>
                                  <td>{p.code}</td>
                                  <td>{p.brand}</td>
                                  <td>{p.type}</td>
                                  <td className="text-sm text-gray-600">{p.description}</td>
                                  <td>{p.stock}</td>
                                  <td>${p.price_usd}</td>
                                  <td>
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
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ---- COLUMNA DERECHA (persistente SIEMPRE) ---- */}
              <div>
                <div className="bg-white border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Presupuesto actual</h3>

                  <div className="max-h-80 overflow-auto space-y-2">
                    {selectedServices.length === 0 && selectedBikeparts.length === 0 && (
                      <p className="text-gray-500">No hay items seleccionados</p>
                    )}

                    {/* Servicios */}
                    {selectedServices.map(s => (
                      <div key={s._id} className="flex justify-between items-center border p-2 rounded">
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-xs text-gray-600">{s.description}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-bold">${Number(s.price_usd).toLocaleString()}</div>
                          <button className="mt-2 text-sm px-2 py-1 bg-gray-200 rounded"
                            onClick={() => unselectServiceById(s._id)}>
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Repuestos */}
                    {selectedBikeparts.map(bp => {
                      const part = bikeparts.find(p => p._id === bp.bikepart_id) || {};
                      return (
                        <div key={bp.bikepart_id} className="flex justify-between items-center border p-2 rounded">
                          <div>
                            <div className="font-semibold">{part.description}</div>
                            <div className="text-xs text-gray-600">{part.brand} - {part.code}</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="font-bold">${(part.price_usd * bp.amount).toLocaleString()}</div>
                            <div className="text-xs">x{bp.amount}</div>
                            <button className="mt-2 text-sm px-2 py-1 bg-gray-200 rounded"
                              onClick={() => removeSelectedBikepart(bp.bikepart_id)}>
                              Quitar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 border-t pt-3">
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">Total Presupuesto (USD)</div>
                      <div className="font-bold">${(totalServicesUSD + totalBikepartsUSD).toLocaleString("es-AR")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-right text-gray-500 text-sm md:text-base mt-2">
            * Los precios están expresados en USD - Cotización actual: {dollarRate === null ? "Cargando..." : `$${dollarRate}`}
          </p>
        </div>

        {/* Cards resumen (igual a tu captura) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* --- CARD 1: Servicios seleccionados --- */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="text-gray-700 font-semibold flex items-center justify-between">
              Servicios Seleccionados
            </div>

            <div className="mt-2 text-3xl font-bold text-blue-600">
              {selectedServices.length}
            </div>

            <div className="text-gray-500 text-sm mt-1">
              Total: ${totalServicesUSD.toLocaleString("es-AR")} USD
            </div>
          </div>

          {/* --- CARD 2: Repuestos seleccionados --- */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="text-gray-700 font-semibold flex items-center justify-between">
              Repuestos Seleccionados
            </div>

            <div className="mt-2 text-3xl font-bold text-green-600">
              {selectedBikeparts.length}
            </div>

            <div className="text-gray-500 text-sm mt-1">
              Total: ${totalBikepartsUSD.toLocaleString("es-AR")} USD
            </div>
          </div>

          {/* --- CARD 3: Total Estimado --- */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="text-gray-700 font-semibold flex items-center justify-between">
              Total Estimado
            </div>

            <div className="mt-2 text-3xl font-bold text-purple-600">
              ${totalBudgetUSD.toLocaleString("es-AR")} USD + ${totalBudgetARS.toLocaleString("es-AR")}
            </div>

            <div className="text-gray-500 text-sm mt-1">
              Servicios + Repuestos
            </div>
          </div>

        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleDownloadPdf}
          >
            Generar PDF
          </button>

          <button
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={handleGenerateBudget}
          >
            Generar presupuesto
          </button>
        </div>
      </div>

      {/* Warranty modal */}
      {showWarrantyModal && (
        <WarrantyMatchModal
          warranties={warrantyMatches}
          onApply={(selectedIds) => {
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

      {/* Budget confirm modal (toma los seleccionados persistentes) */}
      {showModal && (
        <BudgetModal
          closeModal={() => setShowModal(false)}
          selectedServices={selectedServices.map(s => ({
            service_id: s._id,
            name: s.name,
            price: Number(s.price_usd || 0),
            covered: coveredServices.includes(s._id),
          }))}
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

      {/* Add service modal */}
      {showAddService && (
        <AddServiceModal
          onClose={() => setShowAddService(false)}
          onSuccess={handleAddServiceSuccess}
        />
      )}
    </Layout>
  );
};

export default Budget;