import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { BsBox2 } from "react-icons/bs";
import { TfiClipboard } from "react-icons/tfi";
import { PiPersonSimpleBike } from "react-icons/pi";
import { Link } from "react-router-dom";
import { fetchDashboardData } from "../services/dashboardService";

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

  if (loading) return <p className="p-4">Cargando resumen...</p>;
  if (!data) return <p className="p-4 text-red-600">Error al cargar datos.</p>;

  return (
    <Layout>
      <div className="flex flex-col bg-gray-100 p-4 sm:p-6 gap-6">
        {/* Alertas importantes */}
        {data.notifications.length > 0 && (
          <div className="flex flex-col gap-2 bg-red-100 rounded-md border border-red-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-red-600">
              Alertas importantes
            </h2>
            {data.notifications.map((n, i) => (
              <p key={i}>{n.message_body || n.title || "Notificación"}</p>
            ))}
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  <div className="rounded-md border border-gray-300 p-4 bg-white">
    <h2 className="text-base font-medium">{title}</h2>
    <p className={`text-xl font-semibold ${color || "text-gray-800"}`}>{value}</p>
    <p className="text-gray-600">{subtitle}</p>
  </div>
);

const RecentWorks = ({ trabajos }) => (
  <div className="lg:w-3/5 flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
    <h2 className="text-xl sm:text-2xl font-semibold">Trabajos recientes</h2>
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
            className="border border-gray-300 py-2 px-4 rounded-xl flex items-center gap-2"
          >
            <div className="rounded-full bg-blue-100 p-2">
              <PiPersonSimpleBike className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
            </div>
            <div className="flex justify-between w-full items-center flex-wrap sm:flex-nowrap gap-2">
              <div className="min-w-[150px]">
                <p className="font-medium">{clientName}</p>
                <p className="text-gray-700">{bikeModel}</p>
              </div>
              <div className="text-center">
                <p className="p-1 rounded-md bg-blue-200 text-sm capitalize">
                  {t.state || "En proceso"}
                </p>
                <p>${t.total_usd?.toLocaleString("es-AR") || 0}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(t.creation_date).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);

const SideActions = ({ pendientes }) => (
  <div className="lg:w-2/5 flex flex-col gap-4">
    <div className="flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-semibold">Acciones rápidas</h2>
      <ActionLink to="/clientes/nuevo" icon={<LuPlus />} text="Nuevo cliente" />
      <ActionLink to="/presupuestos" icon={<TfiClipboard />} text="Crear presupuesto" />
      <ActionLink to="/repuestos/nuevo" icon={<BsBox2 />} text="Ingreso de repuestos" />
    </div>

    <div className="flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-semibold">Pendientes de retiro</h2>
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
              className="border border-gray-300 p-2 rounded-xl flex items-center gap-2"
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

const ActionLink = ({ to, icon, text }) => (
  <Link
    to={to}
    className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center hover:bg-gray-50 transition"
  >
    {icon}
    {text}
  </Link>
);
