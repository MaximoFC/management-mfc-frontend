import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { BsBox2 } from "react-icons/bs";
import { TfiClipboard } from "react-icons/tfi";
import { PiPersonSimpleBike } from "react-icons/pi";
import { Link } from "react-router-dom";
import { fetchDashboardData } from "../services/dashboardService";
import ClipLoader from "react-spinners/ClipLoader";
import { FiAlertTriangle } from "react-icons/fi";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch (err) {
        console.error("Error al cargar el dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <ClipLoader color="#ef4444" size={50} />
      </div>
    );
  if (!data) return <p className="p-4 text-red-600">Error al cargar datos.</p>;

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Título */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Panel de control
          </h1>

          <p className="text-sm text-gray-500">
            Resumen de actividad del taller
          </p>
        </div>

        {/* Alertas importantes */}
        {data.notifications.length > 0 && (
          <div className="flex items-start justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <FiAlertTriangle className="text-red-600 w-5 h-5" />
              </div>

              <div className="flex flex-col">
                <h2 className="font-semibold text-red-700 text-lg">
                  Alertas importantes
                </h2>

                {data.notifications.map((n, i) => (
                  <p key={i} className="text-red-700 text-sm">
                    {n.message_body || n.title || "Notificación"}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Caja actual"
            value={`$${data.currentCash.toLocaleString("es-AR")}`}
            subtitle="Saldo disponible"
            color="text-green-500"
          />
          <MetricCard
            title="Trabajos pendientes"
            value={data.trabajosPendientes}
            subtitle="Sin empezar"
          />
          <MetricCard
            title="Clientes activos"
            value={data.totalClients}
            subtitle={`+${data.newClients} este mes`}
          />
          <MetricCard
            title="Stock bajo"
            value={data.lowStock}
            subtitle="Repuestos críticos"
            color="text-red-600"
          />
        </div>

        {/* Trabajos recientes + Acciones rápidas */}
        <div className="flex flex-col lg:flex-row gap-4">
          <RecentWorks trabajos={data.trabajosRecientes} />
          <SideActions pendientes={data.pendientesRetiro} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

const MetricCard = ({ title, value, subtitle, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
    <p className="text-sm text-gray-400">{title}</p>

    <p className={`text-3xl font-bold mt-1 ${color || "text-gray-900"}`}>
      {value}
    </p>

    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

const RecentWorks = ({ trabajos }) => (
  <div className="lg:w-3/5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
    <h2 className="text-lg font-semibold text-gray-800 mb-2">Trabajos recientes</h2>
    {trabajos.length === 0 ? (
      <p className="text-gray-500">No hay trabajos recientes.</p>
    ) : (
      trabajos.map((t, i) => {
        const client = t.bike_id?.current_owner_id;
        const bike = t.bike_id;

        const clientName = client
          ? `${client.name} ${client.surname}`.trim()
          : "Cliente desconocido";

        const bikeModel = bike
          ? `${bike.brand} ${bike.model}`.trim()
          : "Bicicleta desconocida";

        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4"
          >
            {/* Columna 1 */}
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-200 p-2">
                <PiPersonSimpleBike className="h-5 w-5 text-gray-500" />
              </div>

              <div className="flex flex-col">
                <p className="font-semibold text-gray-900">{clientName}</p>
                <p className="text-sm text-gray-500">{bikeModel}</p>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="flex flex-col items-start">
              <p
                className={`px-2 py-1 rounded-md text-xs font-medium capitalize
                ${
                  t.state === "terminado"
                    ? "bg-green-100 text-green-700"
                    : t.state === "en proceso"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {t.state || "En proceso"}
              </p>
              
              <p className="font-semibold text-gray-900 mt-1">
                ${t.total_ars?.toLocaleString("es-AR") || 0}
              </p>
            </div>
              
            {/* Columna 3 */}
            <div className="text-sm text-gray-500">
              {new Date(t.creation_date).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        );
      })
    )}
  </div>
);

const SideActions = ({ pendientes }) => (
  <div className="lg:w-2/5 flex flex-col gap-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <h2 className="text-xl sm:text-2xl font-semibold">Acciones rápidas</h2>
      <ActionLink
        to="/clientes"
        icon={<LuPlus className="w-4 h-4 text-red-600" />}
        text="Nuevo cliente"
        subtitle="Registrar un cliente"
        color="bg-red-100"
      />

      <ActionLink
        to="/presupuestos"
        icon={<TfiClipboard className="w-4 h-4 text-blue-600" />}
        text="Crear presupuesto"
        subtitle="Generar cotización"
        color="bg-blue-100"
      />

      <ActionLink
        to="/repuestos"
        icon={<BsBox2 className="w-4 h-4 text-green-600" />}
        text="Ingreso repuestos"
        subtitle="Actualizar stock"
        color="bg-green-100"
      />
    </div>

    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Pendientes de retiro
      </h2>
      {pendientes.length === 0 ? (
        <p className="text-gray-500">No hay bicicletas pendientes.</p>
      ) : (
        pendientes.map((b, i) => {
          const client = b.bike_id?.current_owner_id;
          const bike = b.bike_id;

          const clientName = client
            ? `${client.name} ${client.surname}`.trim()
            : "Cliente desconocido";

          const bikeModel = bike
            ? `${bike.brand} ${bike.model}`.trim()
            : "Bicicleta desconocida";

          return (
            <p
              key={i}
              className="flex items-center gap-3 border border-red-200 bg-red-50 px-3 py-2 rounded-xl"
            >
              <PiPersonSimpleBike className="h-5 w-5 text-red-500" />
              {clientName} - {bikeModel}
            </p>
          );
        })
      )}
    </div>
  </div>
);

const ActionLink = ({ to, icon, text, subtitle, color }) => (
  <Link
    to={to}
    className="flex items-center gap-4 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition"
  >
    <div className={`p-2 rounded-lg ${color}`}>
      {icon}
    </div>

    <div className="flex flex-col">
      <p className="font-medium text-gray-900">{text}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Link>
);
