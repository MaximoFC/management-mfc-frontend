import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { getBalance, getFlows, createFlow, getFlowSummary } from "../services/cashService";
import { isoDateAR, daysAgoISO } from "../utils/dates";
import { LoadingDots } from "../components/ui-primitives";
import Pagination from "../components/Pagination";
import { TfiStatsUp, TfiStatsDown } from "react-icons/tfi";
import { FiPlus, FiArrowUpRight, FiArrowDownLeft, FiSearch } from "react-icons/fi";

const PAGE_SIZE = 10;
const DEFAULT_RANGE_DAYS = 30;

const EMPTY_TOTALS = { ingresos: 0, egresos: 0, balance: 0 };

// Atajos de rango. Nunca se piden todos los movimientos: siempre hay un rango y paginado.
const QUICK_RANGES = [
  { label: "Hoy", range: () => [isoDateAR(), isoDateAR()] },
  { label: "7 días", range: () => [daysAgoISO(6), isoDateAR()] },
  { label: "30 días", range: () => [daysAgoISO(DEFAULT_RANGE_DAYS - 1), isoDateAR()] },
  { label: "Este mes", range: () => [`${isoDateAR().slice(0, 8)}01`, isoDateAR()] },
  { label: "3 meses", range: () => [daysAgoISO(89), isoDateAR()] },
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });

const formatDateTime = (value) =>
  new Date(value).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const inputClasses =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-200";

const SummaryCard = ({ title, data }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-sm font-medium text-gray-500">{title}</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Ingresos</span>
        <span className="font-semibold text-emerald-600">+ {formatCurrency(data.ingresos)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Egresos</span>
        <span className="font-semibold text-red-500">- {formatCurrency(data.egresos)}</span>
      </div>
      <div className="flex justify-between border-t border-gray-100 pt-3">
        <span className="font-medium text-gray-700">Balance</span>
        <span className="font-bold text-gray-900">{formatCurrency(data.balance)}</span>
      </div>
    </div>
  </div>
);

const Cash = () => {
  const [balance, setBalance] = useState(0);
  const [summary, setSummary] = useState({ today: EMPTY_TOTALS, week: EMPTY_TOTALS, month: EMPTY_TOTALS });

  // Por defecto se muestran los últimos 30 días
  const [startDate, setStartDate] = useState(() => daysAgoISO(DEFAULT_RANGE_DAYS - 1));
  const [endDate, setEndDate] = useState(() => isoDateAR());
  const [activeQuick, setActiveQuick] = useState("30 días");

  const [flows, setFlows] = useState({ items: [], total: 0, page: 1, pages: 1, totals: EMPTY_TOTALS });
  // Rango realmente aplicado (la paginación usa este, no lo que esté escrito en los inputs)
  const [appliedRange, setAppliedRange] = useState(() => [daysAgoISO(DEFAULT_RANGE_DAYS - 1), isoDateAR()]);
  const requestId = useRef(0);
  const [loadingFlows, setLoadingFlows] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", amount: "", description: "" });
  const [saving, setSaving] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const [cash, summaryData] = await Promise.all([getBalance(), getFlowSummary()]);
      setBalance(cash.balance);
      setSummary(summaryData);
    } catch {
      toast.error("Error cargando el saldo de la caja");
    }
  }, []);

  const loadFlows = useCallback(async (start, end, page = 1) => {
    // Si se pide otro rango antes de que llegue la respuesta anterior, la vieja se descarta
    const id = ++requestId.current;
    setAppliedRange([start, end]);
    setLoadingFlows(true);
    try {
      const data = await getFlows({ start, end, page, limit: PAGE_SIZE });
      if (id === requestId.current) setFlows({ ...data, totals: data.totals || EMPTY_TOTALS });
    } catch {
      if (id === requestId.current) toast.error("Error cargando los movimientos");
    } finally {
      if (id === requestId.current) setLoadingFlows(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    loadFlows(daysAgoISO(DEFAULT_RANGE_DAYS - 1), isoDateAR());
  }, [loadOverview, loadFlows]);

  const applyQuickRange = (quick) => {
    const [start, end] = quick.range();
    setStartDate(start);
    setEndDate(end);
    setActiveQuick(quick.label);
    loadFlows(start, end);
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.warning("Elegí fecha desde y hasta");
      return;
    }
    if (startDate > endDate) {
      toast.warning("La fecha desde no puede ser posterior a la fecha hasta");
      return;
    }
    setActiveQuick(null);
    loadFlows(startDate, endDate);
  };

  const handleAddManualFlow = async () => {
    if (saving) return;
    if (!(Number(form.amount) > 0)) {
      toast.warning("El monto debe ser mayor a 0");
      return;
    }
    setSaving(true);
    try {
      await createFlow({ type: form.type, amount: Number(form.amount), description: form.description.trim() });
      toast.success("Movimiento registrado");
      setForm({ type: "", amount: "", description: "" });
      setShowModal(false);
      await Promise.all([loadOverview(), loadFlows(appliedRange[0], appliedRange[1], 1)]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al registrar movimiento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
            <p className="mt-1 text-gray-500">Control de ingresos y egresos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex h-11 w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D90429] to-[#EF233C] px-5 font-medium text-white hover:from-[#EF233C] hover:to-[#D90429]"
          >
            <FiPlus className="h-4 w-4" />
            Agregar movimiento
          </button>
        </div>

        {/* Saldo */}
        <div className="rounded-2xl bg-gradient-to-r from-[#D90429] to-[#EF233C] px-5 py-6 sm:px-6 sm:py-8 text-white shadow-sm">
          <p className="text-sm opacity-90">Dinero actual en caja</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold break-words">{formatCurrency(balance)}</h2>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <p className="flex items-center gap-2">
              <TfiStatsUp /> Hoy + {formatCurrency(summary.today.ingresos)}
            </p>
            <p className="flex items-center gap-2">
              <TfiStatsDown /> Hoy - {formatCurrency(summary.today.egresos)}
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryCard title="Hoy" data={summary.today} />
          <SummaryCard title="Esta semana" data={summary.week} />
          <SummaryCard title="Este mes" data={summary.month} />
        </div>

        {/* Historial */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Historial de movimientos</h2>
              <div className="flex flex-wrap gap-2">
                {QUICK_RANGES.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    onClick={() => applyQuickRange(quick)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      activeQuick === quick.label
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full">
                <label htmlFor="cash-from" className="mb-1 block text-sm font-medium text-gray-700">
                  Desde
                </label>
                <input
                  id="cash-from"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div className="w-full">
                <label htmlFor="cash-to" className="mb-1 block text-sm font-medium text-gray-700">
                  Hasta
                </label>
                <input
                  id="cash-to"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={isoDateAR()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={loadingFlows}
                className="flex h-11 min-w-[110px] shrink-0 disabled:cursor-wait disabled:opacity-70 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 font-medium text-gray-700 hover:bg-gray-50"
              >
                {loadingFlows ? <LoadingDots /> : <><FiSearch className="h-4 w-4" /> Buscar</>}
              </button>
            </div>

            {/* Totales del rango */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3 sm:p-4 text-xs sm:text-sm">
              <div className="min-w-0">
                <p className="text-gray-500">Ingresos<span className="hidden sm:inline"> del período</span></p>
                <p className="font-semibold text-emerald-600">+ {formatCurrency(flows.totals.ingresos)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-500">Egresos<span className="hidden sm:inline"> del período</span></p>
                <p className="font-semibold text-red-500">- {formatCurrency(flows.totals.egresos)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-500">Balance<span className="hidden sm:inline"> del período</span></p>
                <p className="font-bold text-gray-900">{formatCurrency(flows.totals.balance)}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-4">Descripción</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {loadingFlows && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <ClipLoader size={28} color="#D90429" />
                    </td>
                  </tr>
                )}

                {!loadingFlows &&
                  flows.items.map((mov) => {
                    const isIncome = mov.type === "ingreso";
                    return (
                      <tr key={mov._id} className="border-b border-gray-100 text-sm last:border-b-0">
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              isIncome ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isIncome ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                            {isIncome ? "Ingreso" : "Egreso"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-800">{mov.description}</td>
                        <td className="px-5 py-4 text-gray-500">{formatDateTime(mov.date)}</td>
                        <td className={`px-5 py-4 text-right font-semibold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                          {isIncome ? "+" : "-"} {formatCurrency(mov.amount)}
                        </td>
                      </tr>
                    );
                  })}

                {!loadingFlows && flows.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No hay movimientos en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Celular: una fila compacta por movimiento */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {loadingFlows && (
              <li className="flex justify-center px-6 py-10">
                <ClipLoader size={24} color="#D90429" />
              </li>
            )}
            {!loadingFlows &&
              flows.items.map((mov) => {
                const isIncome = mov.type === "ingreso";
                return (
                  <li key={mov._id} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isIncome ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                      }`}
                      aria-label={isIncome ? "Ingreso" : "Egreso"}
                    >
                      {isIncome ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 break-words">{mov.description}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(mov.date)}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                      {isIncome ? "+" : "-"} {formatCurrency(mov.amount)}
                    </p>
                  </li>
                );
              })}
            {!loadingFlows && flows.items.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-gray-500">No hay movimientos en este período.</li>
            )}
          </ul>

          <Pagination
            page={flows.page}
            totalPages={flows.pages}
            totalItems={flows.total}
            pageSize={PAGE_SIZE}
            itemLabel="movimientos"
            disabled={loadingFlows}
            onChange={(page) => loadFlows(appliedRange[0], appliedRange[1], page)}
          />
        </div>

        {showModal && (
          <Modal
            title="Movimiento manual"
            onClose={() => setShowModal(false)}
            onConfirm={handleAddManualFlow}
            confirmText="Confirmar"
            loading={saving}
            cancelText="Cancelar"
            disableConfirm={!form.type || !form.amount || !form.description.trim()}
          >
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="flow-type" className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  id="flow-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className={`${inputClasses} cursor-pointer`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>
              <div>
                <label htmlFor="flow-amount" className="mb-1 block text-sm font-medium text-gray-700">
                  Monto (ARS)
                </label>
                <input
                  id="flow-amount"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className={inputClasses}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="flow-description" className="mb-1 block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  id="flow-description"
                  type="text"
                  placeholder="Ej: compra de insumos"
                  className={inputClasses}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Cash;
