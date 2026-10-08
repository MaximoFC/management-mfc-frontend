import { bikeLabel } from "../utils/bikes";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import Layout from "../components/Layout";
import { confirmToast } from "../components/ConfirmToast";
import { fetchBudgetById, completeCheckup, voidWarranty } from "../services/budgetService";
import { formatARS, getServicePriceARS } from "../components/budgetPricing";
import { formatDate } from "../utils/dates";
import { FiArrowLeft, FiCheck, FiPackage, FiShield, FiTool } from "react-icons/fi";

const WARRANTY_STATUS = {
  activa: { label: "Garantía activa", className: "bg-green-100 text-green-700" },
  expirada: { label: "Garantía expirada", className: "bg-gray-100 text-gray-600" },
  anulada: { label: "Garantía anulada", className: "bg-red-100 text-red-600" },
};

const Section = ({ icon, title, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-3 p-6">{children}</div>
  </div>
);

const BudgetDetail = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchBudgetById(id)
      .then(setBudget)
      .catch(() => toast.error("No se pudo cargar el presupuesto"))
      .finally(() => setLoading(false));
  }, [id]);

  const runAction = async (action, successMessage) => {
    setBusy(true);
    try {
      setBudget(await action());
      toast.success(successMessage);
    } catch (err) {
      toast.error(err?.message || "No se pudo completar la acción");
    } finally {
      setBusy(false);
    }
  };

  const serviceId = (s) => s.service_id?._id || s.service_id;

  const handleCheckupComplete = (s, checkupDate) =>
    runAction(() => completeCheckup(id, serviceId(s), checkupDate), "Revisión registrada");

  const handleVoid = (s) =>
    confirmToast(`¿Anular la garantía de "${s.name}"? No se puede deshacer.`, () =>
      runAction(() => voidWarranty(id, serviceId(s)), "Garantía anulada")
    );

  if (loading || !budget) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          {loading ? <ClipLoader size={32} color="#D90429" /> : <p className="text-gray-500">No se encontró el presupuesto.</p>}
        </div>
      </Layout>
    );
  }

  const owner = budget.bike_id?.current_owner_id;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <Link to="/garantias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <FiArrowLeft className="h-4 w-4" /> Volver a garantías
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Detalle del presupuesto</h1>
          <p className="mt-1 text-gray-500">Creado el {formatDate(budget.creation_date)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {[
            ["Cliente", owner ? `${owner.name} ${owner.surname}` : "-", owner?.mobileNum],
            ["Bicicleta", bikeLabel(budget.bike_id)],
            ["Estado", budget.state],
            ["Total", formatARS(budget.total_ars), budget.total_usd ? `Incluye USD ${budget.total_usd}` : null],
          ].map(([title, value, subtitle]) => (
            <div key={title} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <p className="text-sm text-gray-500">{title}</p>
              <p className="mt-2 text-base font-bold capitalize text-gray-900 break-words sm:text-xl">{value}</p>
              {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </div>
          ))}
        </div>

        <Section icon={<FiTool className="h-5 w-5 text-red-600" />} title="Servicios">
          {budget.services.length === 0 && <p className="text-sm text-gray-500">Sin servicios</p>}
          {budget.services.map((s) => {
            const status = s.warranty?.hasWarranty && WARRANTY_STATUS[s.warranty.status];
            const isActive = s.warranty?.status === "activa";
            return (
              <div key={s._id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
                    {s.covered_by_warranty && (
                      <p className="mt-1 text-xs text-green-700">Cubierto por garantía de un trabajo anterior</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {status && (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {formatARS(getServicePriceARS(s, budget.dollar_rate_used))}
                    </span>
                  </div>
                </div>

                {s.warranty?.hasWarranty && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <FiShield className="h-4 w-4 text-gray-500" />
                        Vigencia: {formatDate(s.warranty.startDate)} – {formatDate(s.warranty.endDate)}
                      </p>
                      {isActive && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleVoid(s)}
                          className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Anular garantía
                        </button>
                      )}
                    </div>

                    {s.warranty.checkups?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {s.warranty.checkups.map((c) => (
                          <div
                            key={c.date}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                          >
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">Revisión {formatDate(c.date)}</p>
                              <p className={c.completed ? "text-green-600" : "text-gray-500"}>
                                {c.completed ? "Completada" : "Pendiente"}
                              </p>
                            </div>
                            {!c.completed && isActive && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCheckupComplete(s, c.date)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#D90429] to-[#EF233C] px-4 py-2 text-sm font-medium text-white hover:from-[#EF233C] hover:to-[#D90429] disabled:opacity-50"
                              >
                                <FiCheck className="h-4 w-4" />
                                Marcar como hecha
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        <Section icon={<FiPackage className="h-5 w-5 text-red-600" />} title="Repuestos">
          {budget.parts.length === 0 && <p className="text-sm text-gray-500">Sin repuestos</p>}
          {budget.parts.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{p.description || p.bikepart_id?.description}</p>
                <p className="text-gray-500">
                  {p.amount} x {p.currency} {Number(p.unit_price || 0).toLocaleString("es-AR")}
                </p>
              </div>
              <span className="font-semibold text-gray-900">
                {p.currency} {Number(p.subtotal || 0).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </Section>
      </div>
    </Layout>
  );
};

export default BudgetDetail;
