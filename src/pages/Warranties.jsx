import { bikeLabel } from "../utils/bikes";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import Layout from "../components/Layout";
import { getActiveWarranties } from "../services/budgetService";
import { formatDate, daysUntil } from "../utils/dates";
import { FiSearch, FiShield, FiCalendar, FiAlertTriangle } from "react-icons/fi";

const CHECKUP_WARNING_DAYS = 7; // igual que el aviso del cron

const checkupStatus = (date) => {
    if (!date) return { label: "Sin revisiones pendientes", className: "bg-gray-100 text-gray-600" };
    const days = daysUntil(date);
    if (days < 0) return { label: "Revisión vencida", className: "bg-red-100 text-red-600" };
    if (days === 0) return { label: "Revisión hoy", className: "bg-orange-100 text-orange-600" };
    if (days <= CHECKUP_WARNING_DAYS) return { label: `Revisión en ${days} días`, className: "bg-orange-100 text-orange-600" };
    return { label: `En ${days} días`, className: "bg-green-100 text-green-600" };
};

const StatCard = ({ title, value, subtitle, icon, accent }) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${icon.bg} ${accent}`}>{icon.node}</div>
    </div>
);

const Warranties = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getActiveWarranties()
            .then(setBudgets)
            .catch(() => toast.error("No se pudieron cargar las garantías"))
            .finally(() => setLoading(false));
    }, []);

    // Una fila por servicio en garantía (el backend ya devuelve solo los vigentes)
    const rows = useMemo(
        () =>
            budgets.flatMap((budget) =>
                budget.services.map((s) => {
                    const owner = budget.bike_id?.current_owner_id;
                    return {
                        key: `${budget._id}-${s.service_id?._id || s.service_id}`,
                        budgetId: budget._id,
                        client: owner ? `${owner.name} ${owner.surname}` : "Cliente desconocido",
                        phone: owner?.mobileNum,
                        bike: bikeLabel(budget.bike_id),
                        service: s.name || s.service_id?.name,
                        startDate: s.warranty.startDate,
                        endDate: s.warranty.endDate,
                        nextCheckup: s.warranty.checkups?.find((c) => !c.completed)?.date,
                    };
                })
            ),
        [budgets]
    );

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const list = term
            ? rows.filter((r) => [r.client, r.bike, r.service].some((v) => (v || "").toLowerCase().includes(term)))
            : rows;
        // Primero las que tienen revisión más cercana
        return [...list].sort(
            (a, b) => new Date(a.nextCheckup || a.endDate) - new Date(b.nextCheckup || b.endDate)
        );
    }, [rows, searchTerm]);

    const upcomingCheckups = rows.filter((r) => r.nextCheckup && daysUntil(r.nextCheckup) <= CHECKUP_WARNING_DAYS).length;
    const expiringSoon = rows.filter((r) => daysUntil(r.endDate) <= 30).length;

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Garantías activas</h1>
                    <p className="mt-1 text-gray-500">Servicios con garantía vigente y sus próximas revisiones</p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <StatCard
                        title="Garantías vigentes"
                        value={rows.length}
                        subtitle="Servicios cubiertos"
                        accent="text-green-600"
                        icon={{ bg: "bg-green-100", node: <FiShield className="h-6 w-6" /> }}
                    />
                    <StatCard
                        title="Revisiones próximas"
                        value={upcomingCheckups}
                        subtitle={`En los próximos ${CHECKUP_WARNING_DAYS} días`}
                        accent="text-orange-500"
                        icon={{ bg: "bg-orange-100", node: <FiAlertTriangle className="h-6 w-6" /> }}
                    />
                    <StatCard
                        title="Vencen pronto"
                        value={expiringSoon}
                        subtitle="En los próximos 30 días"
                        accent="text-red-600"
                        icon={{ bg: "bg-red-100", node: <FiCalendar className="h-6 w-6" /> }}
                    />
                </div>

                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        aria-label="Buscar garantía"
                        placeholder="Buscar por cliente, bicicleta o servicio..."
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[800px]">
                        <thead className="border-b border-gray-200">
                            <tr className="text-left text-sm font-semibold text-gray-700">
                                <th className="px-4 py-4">Cliente</th>
                                <th className="px-4 py-4">Bicicleta</th>
                                <th className="px-4 py-4">Servicio cubierto</th>
                                <th className="px-4 py-4">Vigencia</th>
                                <th className="px-4 py-4">Próxima revisión</th>
                                <th className="px-4 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <ClipLoader size={28} color="#D90429" />
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                filtered.map((r) => {
                                    const status = checkupStatus(r.nextCheckup);
                                    return (
                                        <tr key={r.key} className="border-b border-gray-100 text-sm last:border-b-0">
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-gray-900">{r.client}</p>
                                                {r.phone && <p className="text-xs text-gray-500">{r.phone}</p>}
                                            </td>
                                            <td className="px-4 py-4 text-gray-700">{r.bike}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                    {r.service}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600">
                                                {formatDate(r.startDate)} – {formatDate(r.endDate)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-gray-900">{formatDate(r.nextCheckup)}</p>
                                                <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link
                                                    to={`/garantias/${r.budgetId}`}
                                                    className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {rows.length ? "No hay garantías que coincidan con la búsqueda." : "No hay garantías activas."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Warranties;
