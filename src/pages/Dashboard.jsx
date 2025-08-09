import Layout from "../components/Layout";
import { LuPlus } from "react-icons/lu";
import { BsBox2 } from "react-icons/bs";
import { TfiClipboard } from "react-icons/tfi";
import { PiPersonSimpleBike } from "react-icons/pi";

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col bg-gray-100 p-4 sm:p-6 gap-6">
        <div className="flex flex-col gap-2 bg-red-100 rounded-md border border-red-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-red-600">
            Alertas importantes
          </h2>
          <p>Cadenas Shimano - Stock bajo</p>
          <p>Giant Hybrid pendiente de retiro</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Caja actual</h2>
            <p className="text-xl font-semibold text-green-500">$200.000</p>
            <p className="text-gray-600">+ $100.000 hoy</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Trabajos pendientes</h2>
            <p className="text-xl font-semibold">5</p>
            <p className="text-gray-600">Trabajos sin empezar</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Clientes activos</h2>
            <p className="text-xl font-semibold">40</p>
            <p className="text-gray-600">+12 este mes</p>
          </div>
          <div className="rounded-md border border-gray-300 p-4 bg-white">
            <h2 className="text-base font-medium">Stock bajo</h2>
            <p className="text-xl font-semibold text-red-600">3</p>
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
              <a
                href="#"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <LuPlus />
                Nuevo cliente
              </a>
              <a
                href="#"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <TfiClipboard />
                Crear presupuesto
              </a>
              <a
                href="#"
                className="border border-gray-300 py-2 px-4 rounded-md flex gap-3 items-center"
              >
                <BsBox2 />
                Ingreso de repuestos
              </a>
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
