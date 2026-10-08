import { bikeLabel } from "../utils/bikes";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BudgetModal from "../components/BudgetModal";
import AddServiceModal from "../components/AddServiceModal";
import WarrantyMatchModal from "../components/WarrantyMatchModal";
import { fetchDollarRate } from "../services/utilsService";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";
import { searchServices, deleteService } from "../services/serviceService";
import { searchBikepartsPage } from "../services/bikepartService";
import { useRemoteList } from "../hooks/useRemoteList";
import { confirmToast } from "../components/ConfirmToast";
import { createBudget, getActiveWarranties, generateBudgetPdf } from "../services/budgetService";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import { SPARE_TYPES } from "../constants/spareTypes";
import { useBudgetStore } from "../store/useBudgetStore";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingDots } from "../components/ui-primitives";
import { formatARS, formatPartPrice, getPartPriceARS, getServicePriceARS } from "../components/budgetPricing";
import { FiSearch, FiTool, FiPackage, FiFileText, FiPlus, FiTrash2, FiDownload, FiEdit2 } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    borderColor: "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px #e5e7eb" : "none",
    "&:hover": { borderColor: "#d1d5db" },
  }),
};

const PAGE_SIZE = 10;

const Pager = ({ page, pages, total, onChange }) => (
  <div className="flex items-center justify-between text-sm text-gray-500">
    <span>{total} resultados</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>
      <span className="font-medium text-gray-800">
        {page} de {pages}
      </span>
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    </div>
  </div>
);

const loadClientOptions = (input) =>
  fetchClients(input, { limit: 20 })
    .then((list) => list.map((c) => ({ value: c._id, label: `${c.name} ${c.surname}` })))
    .catch(() => []);

const StatCard = ({ title, value, subtitle, icon, accent }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${accent.text}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}>
      {icon}
    </div>
  </div>
);

const Budget = () => {
  const [tab, setTab] = useState("services");
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [partPage, setPartPage] = useState(1);

  // Catálogo paginado desde el servidor: nunca se trae la lista completa
  const servicesList = useRemoteList(
    () => searchServices({ q: serviceSearch.trim(), page: servicePage, limit: PAGE_SIZE }),
    `${serviceSearch.trim()}|${servicePage}`
  );
  const partsList = useRemoteList(
    () => searchBikepartsPage({ search: searchTerm.trim(), type: selectedCategory, page: partPage, limit: PAGE_SIZE }),
    `${searchTerm.trim()}|${selectedCategory}|${partPage}`
  );

  const selectedServices = useBudgetStore((s) => s.selectedServices);
  const toggleService = useBudgetStore((s) => s.toggleService);
  const removeService = useBudgetStore((s) => s.removeService);
  const updateSelectedService = useBudgetStore((s) => s.updateSelectedService);
  const coveredServices = useBudgetStore((s) => s.coveredServices);
  const setCoveredServices = useBudgetStore((s) => s.setCoveredServices);
  const selectedBikeparts = useBudgetStore((s) => s.selectedBikeparts);
  const addBikepart = useBudgetStore((s) => s.addBikepart);
  const updateBikepartAmount = useBudgetStore((s) => s.updateBikepartAmount);
  const removeBikepart = useBudgetStore((s) => s.removeBikepart);
  const clearBudget = useBudgetStore((s) => s.clearBudget);
  const clientId = useBudgetStore((s) => s.clientId);
  const clientLabel = useBudgetStore((s) => s.clientLabel);
  const bikeId = useBudgetStore((s) => s.bikeId);
  const setClientId = useBudgetStore((s) => s.setClientId);
  const setBikeId = useBudgetStore((s) => s.setBikeId);

  const [showModal, setShowModal] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyMatches, setWarrantyMatches] = useState([]);
  const [checkingWarranties, setCheckingWarranties] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [dollarRate, setDollarRate] = useState(null);
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchDollarRate()
      .then((r) => mounted && setDollarRate(r))
      .catch(() => mounted && toast.warning("No se pudo obtener la cotización del dólar"));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!clientId) {
      setBikes([]);
      return;
    }
    let mounted = true;
    fetchBikesByClient(clientId)
      .then((res) => mounted && setBikes(Array.isArray(res) ? res : []))
      .catch(() => mounted && toast.error("No se pudieron cargar las bicicletas"));
    return () => {
      mounted = false;
    };
  }, [clientId]);

  const findPart = (id) => selectedBikeparts.find((bp) => bp.bikepart_id === id)?.part;

  const servicesTotalARS = selectedServices.reduce(
    (acc, s) => acc + getServicePriceARS(s, dollarRate, coveredServices.includes(s._id)),
    0
  );
  const partsTotalARS = selectedBikeparts.reduce(
    (acc, bp) => acc + getPartPriceARS(findPart(bp.bikepart_id), bp.amount, dollarRate),
    0
  );
  const hasUsdParts = selectedBikeparts.some((bp) => findPart(bp.bikepart_id)?.currency === "USD");
  const totalARS = servicesTotalARS + partsTotalARS;

  const handleClientChange = (selected) => {
    setClientId(selected?.value || null, selected?.label || "");
    setBikeId(null);
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    const items = [
      ...selectedServices.map((s) => ({
        type: "service",
        name: s.name,
        qty: 1,
        price: getServicePriceARS(s, dollarRate, coveredServices.includes(s._id)),
      })),
      ...selectedBikeparts.map((bp) => {
        const part = findPart(bp.bikepart_id);
        return {
          type: "part",
          name: part?.description || "Repuesto",
          qty: bp.amount,
          price: getPartPriceARS(part, 1, dollarRate),
        };
      }),
    ];

    setDownloadingPdf(true);
    try {
      const blob = await generateBudgetPdf({
        name: "Mecánica Facundo Callejas",
        address: "Paraguay 1674, Yerba Buena",
        mobileNum: "+54 9 381 547-5600",
        items,
        total: totalARS,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "presupuesto.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Error generando PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleConfirmBudget = async () => {
    try {
      await createBudget({
        bike_id: bikeId,
        services: selectedServices.map((s) => ({ service_id: s._id })),
        bikeparts: selectedBikeparts.map((bp) => ({ bikepart_id: bp.bikepart_id, amount: bp.amount })),
        applyWarranty: coveredServices,
      });
      toast.success("Presupuesto generado con éxito");
      clearBudget();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.message || "Error al generar el presupuesto");
    }
  };

  // Antes de confirmar, ofrecer las garantías vigentes de la bici para los servicios elegidos
  const handleGenerateBudget = async () => {
    if (!clientId || !bikeId) {
      toast.warning("Seleccioná cliente y bicicleta");
      return;
    }
    if (!selectedServices.length && !selectedBikeparts.length) {
      toast.warning("Agregá al menos un servicio o repuesto");
      return;
    }
    const invalidPart = selectedBikeparts.find((bp) => {
      const part = findPart(bp.bikepart_id);
      return !Number.isInteger(bp.amount) || bp.amount < 1 || (part && bp.amount > part.stock);
    });
    if (invalidPart) {
      toast.warning(`Cantidad inválida para ${findPart(invalidPart.bikepart_id)?.description || "un repuesto"}`);
      return;
    }

    setCheckingWarranties(true);
    try {
      const warranties = await getActiveWarranties(clientId, bikeId);
      const active = warranties.flatMap((b) =>
        b.services.map((s) => ({
          serviceId: String(s.service_id?._id || s.service_id),
          endDate: s.warranty.endDate,
        }))
      );

      const matches = selectedServices
        .map((s) => ({ service: s, warranty: active.find((w) => w.serviceId === s._id) }))
        .filter((m) => m.warranty)
        .map(({ service, warranty }) => ({ serviceId: service._id, name: service.name, endDate: warranty.endDate }));

      setCoveredServices([]);
      if (matches.length > 0) {
        setWarrantyMatches(matches);
        setShowWarrantyModal(true);
      } else {
        setShowModal(true);
      }
    } catch {
      toast.error("Error verificando garantías");
    } finally {
      setCheckingWarranties(false);
    }
  };

  const handleDeleteService = (service) =>
    confirmToast(`¿Eliminar el servicio "${service.name}" del catálogo?`, async () => {
      try {
        await deleteService(service._id);
        removeService(service._id);
        // Si era el último de la página, volver a la anterior
        if (servicesList.items.length === 1 && servicePage > 1) setServicePage((p) => p - 1);
        else servicesList.reload();
        toast.success("Servicio eliminado");
      } catch (err) {
        toast.error(err.message);
      }
    });

  // Si el servicio editado ya estaba en el presupuesto en armado, actualizar su precio en la vista previa
  const handleEditServiceSuccess = (updated) => {
    updateSelectedService(updated);
    servicesList.reload();
  };

  const handleAddServiceSuccess = (newService) => {
    servicesList.reload();
    if (!selectedServices.some((s) => s._id === newService._id)) toggleService(newService);
    setServiceSearch("");
    setShowAddService(false);
    toast.success("Servicio agregado al presupuesto");
  };

  const isEmpty = selectedServices.length === 0 && selectedBikeparts.length === 0;

  const tabClasses = (active) =>
    `flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear presupuesto</h1>
            <p className="mt-1 text-gray-500">Elegí cliente, bicicleta, servicios y repuestos</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isEmpty} loading={downloadingPdf}>
              <FiDownload className="h-4 w-4" />
              Generar PDF
            </Button>
            <Button onClick={handleGenerateBudget} loading={checkingWarranties} className="min-w-[200px]">
              <FiFileText className="h-4 w-4" />
              Generar presupuesto
            </Button>
          </div>
        </div>

        <Card>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <div>
              <label htmlFor="budget-client" className="mb-1 block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <AsyncSelect
                inputId="budget-client"
                cacheOptions
                defaultOptions
                loadOptions={loadClientOptions}
                value={clientId ? { value: clientId, label: clientLabel || "Cliente seleccionado" } : null}
                onChange={handleClientChange}
                placeholder="Buscá un cliente"
                noOptionsMessage={() => "Sin resultados"}
                loadingMessage={() => "Buscando..."}
                styles={selectStyles}
                isClearable
                isSearchable
              />
            </div>
            <div>
              <label htmlFor="budget-bike" className="mb-1 block text-sm font-medium text-gray-700">
                Bicicleta
              </label>
              <select
                id="budget-bike"
                className="h-11 w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50"
                value={bikeId || ""}
                onChange={(e) => setBikeId(e.target.value || null)}
                disabled={!clientId}
              >
                <option value="">{clientId ? "Seleccioná bicicleta" : "Primero elegí un cliente"}</option>
                {bikes.map((b) => (
                  <option key={b._id} value={b._id}>
                    {bikeLabel(b)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Catálogo */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  {tab === "services" ? <FiTool className="text-red-600" /> : <FiPackage className="text-red-600" />}
                  Catálogo
                </CardTitle>
                {tab === "services" && (
                  <Button size="sm" variant="outline" onClick={() => setShowAddService(true)}>
                    <FiPlus className="h-4 w-4" />
                    Nuevo servicio
                  </Button>
                )}
              </div>
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                <button type="button" className={tabClasses(tab === "services")} onClick={() => setTab("services")}>
                  Servicios
                </button>
                <button type="button" className={tabClasses(tab === "parts")} onClick={() => setTab("parts")}>
                  Repuestos
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {tab === "services" && (
                <>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar servicio..."
                      aria-label="Buscar servicio"
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value);
                        setServicePage(1);
                      }}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 border-b border-gray-200 bg-white text-left font-semibold text-gray-700">
                        <tr>
                          <th className="w-10 px-4 py-3"><span className="sr-only">Seleccionar</span></th>
                          <th className="px-4 py-3">Servicio</th>
                          <th className="px-4 py-3 text-right">Precio</th>
                          <th className="w-16 px-2 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicesList.items.map((s) => (
                          <tr
                            key={s._id}
                            className="cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                            onClick={() => toggleService(s)}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                aria-label={`Seleccionar ${s.name}`}
                                className="h-4 w-4 cursor-pointer accent-[#D90429]"
                                checked={selectedServices.some((ss) => ss._id === s._id)}
                                onChange={() => toggleService(s)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{s.name}</p>
                              {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {s.price_ars != null ? formatARS(s.price_ars) : <span className="text-xs text-orange-600">Sin precio</span>}
                            </td>
                            <td className="px-2 py-3">
                              <div className="flex items-center gap-3">
                              <button
                                type="button"
                                aria-label={`Editar servicio ${s.name}`}
                                title="Editar servicio"
                                className="cursor-pointer text-gray-400 hover:text-gray-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingService(s);
                                }}
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Eliminar servicio ${s.name}`}
                                title="Eliminar del catálogo"
                                className="cursor-pointer text-gray-400 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteService(s);
                                }}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {servicesList.items.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                              {servicesList.loading ? <LoadingDots className="text-gray-400" /> : servicesList.error || "No se encontraron servicios."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pager page={servicesList.page} pages={servicesList.pages} total={servicesList.total} onChange={setServicePage} />
                </>
              )}

              {tab === "parts" && (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Buscar por código, marca o descripción..."
                        aria-label="Buscar repuesto"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPartPage(1);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <select
                      aria-label="Filtrar por tipo"
                      className="h-11 cursor-pointer rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPartPage(1);
                      }}
                    >
                      <option value="">Todos los tipos</option>
                      {SPARE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 border-b border-gray-200 bg-white text-left font-semibold text-gray-700">
                        <tr>
                          <th className="w-10 px-4 py-3"><span className="sr-only">Seleccionar</span></th>
                          <th className="px-4 py-3">Repuesto</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3 text-right">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partsList.items.map((p) => {
                          const selected = selectedBikeparts.some((item) => item.bikepart_id === p._id);
                          return (
                            <tr
                              key={p._id}
                              className="cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                              onClick={() => addBikepart(p)}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  aria-label={`Seleccionar ${p.description}`}
                                  className="h-4 w-4 cursor-pointer accent-[#D90429]"
                                  checked={selected}
                                  onChange={() => addBikepart(p)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{p.description}</p>
                                <p className="text-xs text-gray-500">
                                  {p.code} · {p.brand} · {p.type}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    p.stock <= 5 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {p.stock}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPartPrice(p)}</td>
                            </tr>
                          );
                        })}
                        {partsList.items.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                              {partsList.loading ? <LoadingDots className="text-gray-400" /> : partsList.error || "No se encontraron repuestos con stock."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pager page={partsList.page} pages={partsList.pages} total={partsList.total} onChange={setPartPage} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Presupuesto actual */}
          <Card className="h-fit lg:sticky lg:top-24 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FiFileText className="text-red-600" />
                Presupuesto actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[420px] space-y-2 overflow-auto">
                {isEmpty && (
                  <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                    Seleccioná servicios o repuestos del catálogo
                  </div>
                )}

                {selectedServices.map((s) => (
                  <div key={s._id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3">
                    <div className="min-w-0 break-words">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">Servicio</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{formatARS(getServicePriceARS(s, dollarRate))}</span>
                      <button
                        type="button"
                        aria-label={`Quitar ${s.name}`}
                        className="cursor-pointer text-gray-400 hover:text-red-600"
                        onClick={() => removeService(s._id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedBikeparts.map((bp) => {
                  const part = findPart(bp.bikepart_id) || {};
                  return (
                    <div key={bp.bikepart_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3">
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="font-medium text-gray-900">{part.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatPartPrice(part)} c/u · stock {part.stock}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max={part.stock}
                          aria-label={`Cantidad de ${part.description}`}
                          className="h-9 w-16 rounded-lg border border-gray-300 px-2 text-right text-sm outline-none focus:ring-2 focus:ring-gray-200"
                          value={bp.amount}
                          onChange={(e) => updateBikepartAmount(bp.bikepart_id, e.target.value)}
                        />
                        <span className="w-24 text-right font-semibold text-gray-900">
                          {formatARS(getPartPriceARS(part, bp.amount, dollarRate))}
                        </span>
                        <button
                          type="button"
                          aria-label={`Quitar ${part.description}`}
                          className="cursor-pointer text-gray-400 hover:text-red-600"
                          onClick={() => removeBikepart(bp.bikepart_id)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isEmpty && (
                <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                  <span className="font-semibold text-gray-900">Total estimado</span>
                  <span className="text-2xl font-bold text-gray-900">{formatARS(totalARS)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Servicios"
            value={formatARS(servicesTotalARS)}
            subtitle={`${selectedServices.length} seleccionados`}
            icon={<FiTool className="h-6 w-6" />}
            accent={{ bg: "bg-red-100", text: "text-red-600" }}
          />
          <StatCard
            title="Repuestos"
            value={formatARS(partsTotalARS)}
            subtitle={`${selectedBikeparts.length} seleccionados`}
            icon={<FiPackage className="h-6 w-6" />}
            accent={{ bg: "bg-orange-100", text: "text-orange-500" }}
          />
          <StatCard
            title="Total estimado"
            value={formatARS(totalARS)}
            subtitle={hasUsdParts ? `Repuestos USD a $${dollarRate ?? "-"}` : "En pesos"}
            icon={<MdAttachMoney className="h-6 w-6" />}
            accent={{ bg: "bg-green-100", text: "text-green-600" }}
          />
        </div>
      </div>

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

      {showModal && (
        <BudgetModal
          closeModal={() => setShowModal(false)}
          selectedServices={selectedServices}
          selectedBikeparts={selectedBikeparts}
          bikeparts={selectedBikeparts.map((bp) => bp.part).filter(Boolean)}
          dollarRate={dollarRate}
          coveredServices={coveredServices}
          onConfirm={handleConfirmBudget}
        />
      )}

      {editingService && (
        <AddServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSuccess={handleEditServiceSuccess}
        />
      )}

      {showAddService && (
        <AddServiceModal onClose={() => setShowAddService(false)} onSuccess={handleAddServiceSuccess} />
      )}
    </Layout>
  );
};

export default Budget;
