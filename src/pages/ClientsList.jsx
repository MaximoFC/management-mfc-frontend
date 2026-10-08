import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import { LoadingDots } from "../components/ui-primitives";
import Layout from "../components/Layout";
import { useGlobalSearch } from "../context/SearchContext";
import NewClient from "./NewClient";
import { useInventoryStore } from "../store/useInventoryStore";
import {
  FiUsers,
  FiUserPlus,
  FiPhone,
  FiChevronRight,
} from "react-icons/fi";
import { FaBicycle } from "react-icons/fa";

const ClientList = () => {
  const searchTerm = useGlobalSearch("Buscar cliente por nombre o teléfono");
  const { clients, fetchBootstrap, loadingBootstrap } = useInventoryStore();
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;


  // --- Inicializar bootstrap ---
  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // --- Filtrado según searchTerm ---
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter((c) =>
      `${c.name} ${c.surname} ${c.mobileNum || ""}`.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [clients, searchTerm]);


  // --- Cálculos estadísticos ---
  const totalBikes = clients.reduce((sum, c) => sum + c.bikes.length, 0);
  const now = new Date();
  const recentClients = clients.filter((c) => {
    const created = new Date(c.createdAt);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  // --- Paginación ---
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));

  const stats = [
    { title: "Clientes", value: clients.length, subtitle: "Registrados en el sistema", color: "text-gray-900", bg: "bg-red-100 text-red-500", icon: <FiUsers /> },
    { title: "Bicicletas", value: totalBikes, subtitle: "En el registro", color: "text-blue-500", bg: "bg-blue-100 text-blue-500", icon: <FaBicycle /> },
    { title: "Nuevos", value: recentClients, subtitle: "Últimos 30 días", color: "text-green-600", bg: "bg-green-100 text-green-600", icon: <FiUserPlus /> },
  ];

  const bikesSummary = (c) =>
    c.bikes.length === 0 ? (
      <span className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500">Sin bicicletas</span>
    ) : c.bikes.length === 1 ? (
      <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
        <FaBicycle className="shrink-0 text-blue-500 text-sm" />
        <span className="truncate">{c.bikes[0].brand} {c.bikes[0].model}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
        <FaBicycle className="text-xs" />
        {c.bikes.length} bicicletas
      </span>
    );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="mt-1 text-gray-500">Gestiona tu cartera de clientes</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="h-11 w-full sm:w-auto px-5 rounded-xl bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#D90429] text-white font-medium cursor-pointer flex items-center justify-center gap-2"
          >
            <FiUserPlus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>

        <NewClient showModal={showModal} onClose={() => setShowModal(false)} />

        {/* Stats: en celular, tres tarjetas compactas en una fila */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {stats.map((stat) => (
            <div key={stat.title} className="min-w-0 bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 shadow-sm flex items-center gap-4">
              <div className={`hidden sm:flex w-11 h-11 shrink-0 rounded-xl items-center justify-center text-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">{stat.title}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="hidden sm:block text-xs text-gray-400">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Listado */}
        {loadingBootstrap ? (
          <div className="flex justify-center py-12 text-[#D90429]">
            <LoadingDots />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-500">
            No hay clientes registrados.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Encabezado de columnas: solo en pantallas medianas o más */}
            <div className="hidden md:grid grid-cols-3 px-6 py-4 text-xs font-semibold text-gray-400 border-b border-gray-100">
              <span>CLIENTE</span>
              <span>TELÉFONO</span>
              <span>BICICLETAS</span>
            </div>

            <ul className="divide-y divide-gray-100">
              {paginatedClients.map((c) => {
                const initials = `${c.name?.[0] || ""}${c.surname?.[0] || ""}`.toUpperCase();
                return (
                  <li key={c._id}>
                    <Link
                      to={`/clientes/${c._id}`}
                      className="flex items-center gap-3 px-4 py-4 sm:px-6 hover:bg-gray-50 md:grid md:grid-cols-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-semibold">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {c.name} {c.surname}
                          </p>
                          {/* En celular, teléfono y bicis debajo del nombre */}
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FiPhone className="text-gray-400" />
                              {c.mobileNum}
                            </span>
                            {bikesSummary(c)}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-2 text-gray-700 text-sm">
                        <FiPhone className="text-gray-400 text-sm" />
                        {c.mobileNum}
                      </div>

                      <div className="hidden md:block">{bikesSummary(c)}</div>

                      <FiChevronRight className="shrink-0 text-gray-300 md:hidden" />
                    </Link>
                  </li>
                );
              })}
              {paginatedClients.length === 0 && (
                <li className="px-6 py-12 text-center text-gray-500">No hay clientes que coincidan con la búsqueda.</li>
              )}
            </ul>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={itemsPerPage}
              itemLabel="clientes"
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientList;
