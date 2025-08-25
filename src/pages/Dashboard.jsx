import Layout from "../components/Layout";
import { LuPlus } from "react-icons/lu";
import { BsBox2 } from "react-icons/bs";
import { TfiClipboard } from "react-icons/tfi";
import { PiPersonSimpleBike } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          cashRes,
          budgetRes,
          clientRes,
          bikepartsRes,
          notificationRes
        ] = await Promise.all([
          axios.get("http://localhost:4000/api/cash/balance"),
          axios.get("http://localhost:4000/api/budgets"),
          axios.get("http://localhost:4000/api/clients"),
          axios.get("http://localhost:4000/api/bikeparts"),
          axios.get("http://localhost:4000/api/notifications"),
        ]);

        const currentCash = cashRes.data.balance || 0;

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const incomeToday = cashRes.data.flow
          ? cashRes.data.flow
            .filter(f => new Date(f.date) >= last24h && f.amount > 0)
            .reduce((sum, f) => sum + f.amount, 0)
          : 0;

        const pendingWorks = budgetRes.data.filter(
          b => b.status && b.status.toLowerCase().includes("pendiente")
        );

        const totalClients = clientRes.data.length;
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const newClients = clientRes.data.filter(
          c => new Date(c.created_at) >= lastMonth
        ).length;

        const lowStock = bikepartsRes.data.filter(p => p.stock <= 3);

        // Notificaciones recientes
        const recentNotifications = notificationRes.data
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 3);

        // Trabajos recientes
        const trabajosRecientes = budgetRes.data
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 3);

        // Pendientes de retiro (pueden ser los mismos que trabajosPendientes si aplica)
        const pendientesRetiro = budgetRes.data.filter(
          b => b.status && b.status.toLowerCase().includes("iniciado")
        );

        setData({
          currentCash,
          incomeToday,
          trabajosPendientes: pendingWorks.length,
          totalClients,
          newClients,
          lowStock: lowStock.length,
          notifications: recentNotifications,
          trabajosRecientes,
          pendientesRetiro,
        });
      } catch (err) {
        console.error("Error cargando dashboard", err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <p className="p-4">Cargando...</p>;

  return (
    <Layout>
      <div className="flex flex-col bg-gray-100 p-4 sm:p-6 gap-6">
        <div className="flex flex-col gap-2 bg-red-100 rounded-md border border-red-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-red-600">
            Alertas importantes
          </h2>
          {data.notifications.map((n, i) => (
            <p key={i}>{n.message_body}</p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Caja actual</h2>
            <p className="text-xl font-semibold text-green-500">${data.currentCash.toLocaleString("es-AR")}</p>
            <p className="text-gray-600">+ ${data.incomeToday.toLocaleString("es-AR")} hoy</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Trabajos pendientes</h2>
            <p className="text-xl font-semibold">{data.trabajosPendientes}</p>
            <p className="text-gray-600">Trabajos sin empezar</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Clientes activos</h2>
            <p className="text-xl font-semibold">{data.totalClients}</p>
            <p className="text-gray-600">+12 este mes</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Stock bajo</h2>
            <p className="text-xl font-semibold text-red-600">{data.lowStock}</p>
            <p className="text-gray-600">Repuestos críticos</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-3/5 flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Trabajos recientes
            </h2>

            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-300 py-2 px-4 rounded-xl flex items-center gap-2"
              >
                <div className="rounded-full bg-blue-100 p-2">
                  <PiPersonSimpleBike className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
                <div className="flex justify-between w-full items-center flex-wrap sm:flex-nowrap gap-2">
                  <div className="min-w-[150px]">
                    <p>Nombre Apellido</p>
                    <p>Modelo de bici</p>
                  </div>
                  <div className="text-center">
                    <p className="p-1 rounded-md bg-blue-200 text-sm">
                      En proceso
                    </p>
                    <p>$70.000</p>
                    <p className="text-gray-600 text-sm">20/06/25</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-2/5 flex flex-col gap-4">
            <div className="flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Acciones rápidas
              </h2>
              <Link
                to="/clientes/nuevo"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <LuPlus />
                Nuevo cliente
              </Link>
              <Link
                to="/presupuestos"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <TfiClipboard />
                Crear presupuesto
              </Link>
              <Link
                to="/repuestos/nuevo"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <BsBox2 />
                Ingreso de repuestos
              </Link>
            </div>

            <div className="flex flex-col gap-2 border border-gray-300 rounded-md bg-white py-4 px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Pendientes de retiro
              </h2>
              {["Ana Martínez", "Juan Perez", "Pablo Gómez"].map(
                (cliente, idx) => (
                  <p
                    key={idx}
                    className="border border-gray-300 p-2 rounded-xl flex items-center gap-2"
                  >
                    <PiPersonSimpleBike className="h-5 w-5 text-red-500" />
                    {cliente} - Modelo
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
