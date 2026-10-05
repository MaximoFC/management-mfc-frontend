import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { useRemoteList } from "../hooks/useRemoteList";
import { searchServices } from "../services/serviceService";
import { searchBikepartsPage } from "../services/bikepartService";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "./ui-primitives";
import { FiSearch, FiTool, FiPackage, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { calculateEditableTotalARS, formatARS, formatPartPrice, getServicePriceARS } from "./budgetPricing";

/**
 * Fila de búsqueda + selección genérica (sirve tanto para servicios como repuestos).
 * Se extrajo para no repetir el mismo bloque de input + dropdown dos veces.
 */
function SearchSelectRow({ placeholder, displayValue, searchValue, fetchOptions, excludeIds, onSearch, onSelect, renderOption }) {
  const term = searchValue.trim();
  const results = useRemoteList(
    () => (term.length >= 2 ? fetchOptions(term) : Promise.resolve({ items: [] })),
    term
  );
  const options = results.items.filter((opt) => !excludeIds.includes(opt._id));
  const showDropdown = !displayValue && term.length >= 2 && options.length > 0;

  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        value={displayValue || searchValue}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-md">
          {options.map((opt) => (
            <button
              type="button"
              key={opt._id}
              onClick={() => onSelect(opt)}
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {renderOption(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EditBudgetModal = ({ budget, onClose, onSave }) => {

  const [serviceSearchTerms, setServiceSearchTerms] = useState({});
  const [partSearchTerms, setPartSearchTerms] = useState({});
  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);

  const dollarRate = Number(budget.dollar_rate_used || 1);

  useEffect(() => {
    setServices(
      (budget.services || []).map((s) => ({
        _id: s.service_id?._id || s.service_id || s._id || "",
        name: s.name || "",
        price: getServicePriceARS(s, dollarRate),
      }))
    );

    setParts(
      (budget.parts || []).map((p) => ({
        _id: p.bikepart_id?._id || p.bikepart_id || p._id || "",
        description: p.description || p.bikepart_id?.description || "",
        price: Number(p.unit_price ?? 0),
        currency: p.currency || "USD",
        amount: Number(p.amount || 1),
      }))
    );
  }, [budget, dollarRate]);

  // El total se deriva de services/parts en vez de guardarse en un state aparte:
  // antes había que acordarse de llamar setTotal(...) manualmente después de
  // cada acción, y era fácil (y pasó) olvidarse en algún handler.
  const total = useMemo(
    () => calculateEditableTotalARS(services, parts, dollarRate),
    [services, parts, dollarRate]
  );

  // --- Services ---
  const addService = () => setServices((prev) => [...prev, { _id: "", name: "", price: 0 }]);

  const updateService = (index, srv) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { _id: srv._id, name: srv.name, price: Number(srv.price_ars || 0) };
      return updated;
    });
  };

  const removeService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
    setServiceSearchTerms({}); // los términos se indexan por fila: al borrar se desfasan
  };

  const updateServiceSearch = (index, value) => {
    setServiceSearchTerms((prev) => ({ ...prev, [index]: value }));
    // si el usuario vuelve a escribir, se limpia la selección previa
    setServices((prev) => {
      if (!prev[index]?._id) return prev;
      const updated = [...prev];
      updated[index] = { _id: "", name: "", price: 0 };
      return updated;
    });
  };

  // --- Parts ---
  const addPart = () =>
    setParts((prev) => [...prev, { _id: "", description: "", price: 0, currency: "USD", amount: 1 }]);

  const updatePart = (index, part) => {
    setParts((prev) => {
      const updated = [...prev];
      updated[index] = {
        _id: part._id,
        code: part.code,
        stock: part.stock,
        description: part.description,
        price: Number(part.price || 0),
        currency: part.currency === "ARS" ? "ARS" : "USD",
        amount: 1,
      };
      return updated;
    });
  };

  const updatePartAmount = (index, value) => {
    const qty = Number(value || 0) || 0;
    setParts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: qty };
      return updated;
    });
  };

  const removePart = (index) => {
    setParts((prev) => prev.filter((_, i) => i !== index));
    setPartSearchTerms({});
  };

  const updatePartSearch = (index, value) => {
    setPartSearchTerms((prev) => ({ ...prev, [index]: value }));
    setParts((prev) => {
      if (!prev[index]?._id) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], _id: "", description: "", price: 0 };
      return updated;
    });
  };

  const [saving, setSaving] = useState(false);

  // Las filas agregadas sin elegir servicio/repuesto se ignoran
  const handleConfirm = async () => {
    if (saving) return;
    if (parts.some((p) => p._id && !(Number(p.amount) >= 1))) {
      toast.warning("Revisá las cantidades de los repuestos");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        services: services.filter((s) => s._id).map((s) => ({ service_id: s._id })),
        bikeparts: parts.filter((p) => p._id).map((p) => ({ bikepart_id: p._id, amount: Number(p.amount) })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Editar presupuesto"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText="Guardar"
      loading={saving}
    >
      <div className="space-y-6">
        {/* --- SERVICIOS --- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FiTool className="h-4 w-4 text-red-600" />
              Servicios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((s, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Servicio</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Eliminar servicio"
                    onClick={() => removeService(idx)}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>

                <SearchSelectRow
                  placeholder="Buscar servicio..."
                  displayValue={s._id ? s.name : ""}
                  searchValue={serviceSearchTerms[idx] || ""}
                  fetchOptions={(q) => searchServices({ q, limit: 8 })}
                  excludeIds={services.map((x) => x._id)}
                  onSearch={(value) => updateServiceSearch(idx, value)}
                  onSelect={(srv) => {
                    updateService(idx, srv);
                    setServiceSearchTerms((prev) => ({ ...prev, [idx]: "" }));
                  }}
                  renderOption={(srv) => (
                    <>
                      <span className="font-medium">{srv.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatARS(srv.price_ars)}
                      </span>
                    </>
                  )}
                />

                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>{formatARS(Number(s.price || 0))}</span>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full gap-2" onClick={addService}>
              <FiPlus className="h-4 w-4" />
              Agregar servicio
            </Button>
          </CardContent>
        </Card>

        {/* --- REPUESTOS --- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FiPackage className="h-4 w-4 text-red-600" />
              Repuestos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {parts.map((p, idx) => {
              const unitPrice = Number(p.price || 0);
              const subtotal = unitPrice * Number(p.amount || 0);

              return (
                <div key={idx} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Repuesto</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Eliminar repuesto"
                      onClick={() => removePart(idx)}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <SearchSelectRow
                    placeholder="Buscar por código o descripción..."
                    displayValue={p._id ? [p.code, p.description].filter(Boolean).join(" - ") : ""}
                    searchValue={partSearchTerms[idx] || ""}
                    fetchOptions={(q) => searchBikepartsPage({ search: q, limit: 8 })}
                    excludeIds={parts.map((x) => x._id)}
                    onSearch={(value) => updatePartSearch(idx, value)}
                    onSelect={(part) => {
                      updatePart(idx, part);
                      setPartSearchTerms((prev) => ({ ...prev, [idx]: "" }));
                    }}
                    renderOption={(part) => (
                      <>
                        <span className="font-medium">
                          {part.code} — {part.description}
                        </span>
                        <span className="text-xs text-gray-500">
                          Stock: {part.stock} | {formatPartPrice(part)}
                        </span>
                      </>
                    )}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Precio unitario</span>
                    <span>{formatARS(unitPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cantidad</span>
                    <Input
                      type="number"
                      min="1"
                      className="w-20 text-right"
                      value={p.amount}
                      onChange={(e) => updatePartAmount(idx, e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Subtotal</span>
                    <span>{formatARS(subtotal)}</span>
                  </div>

                  {p.stock != null && (
                    <Badge variant="outline" className="w-fit text-xs font-normal text-gray-500">
                      Stock disponible: {p.stock}
                    </Badge>
                  )}
                </div>
              );
            })}

            <Button type="button" variant="outline" className="w-full gap-2" onClick={addPart}>
              <FiPlus className="h-4 w-4" />
              Agregar repuesto
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
          <span className="font-semibold">Total estimado (ARS)</span>
          <span className="text-xl font-bold text-gray-900">{formatARS(total)}</span>
        </div>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;