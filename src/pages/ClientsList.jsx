import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSearch } from "../context/SearchContext";
import NewClient from "./NewClient";
import { useInventoryStore } from "../store/useInventoryStore";
import {
  FiUsers,
  FiUserPlus,
  FiPhone,
} from "react-icons/fi";
import { FaBicycle } from "react-icons/fa";

const ClientList = () => {
  const { searchTerm, setSearchPlaceholder, setOnSearch, setSearchTerm } =
    useSearch();
  const { clients, fetchBootstrap, loadingBootstrap } = useInventoryStore();
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // --- Inicializar bootstrap ---
  useEffect(() => {
    fetchBootstrap();
  }, []);

  // --- Filtrado según searchTerm ---
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter((c) =>
      `${c.name} ${c.surname}`.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [clients, searchTerm]);

  // --- Configuración de search context ---
  useEffect(() => {
    setSearchPlaceholder("Buscar cliente por nombre");

    setOnSearch(() => (term) => {
      setSearchTerm(term);
    });

    return () => {
      setSearchPlaceholder("Buscar cliente, trabajo o repuesto");
      setOnSearch(null);
      setSearchTerm("");
    };
  }, []);

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

  return (
    <Layout>
      <div className="flex flex-col gap-6 min-h-screen">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-gray-500 text-sm">
              Gestiona tu cartera de clientes
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm"
          >
            + Nuevo Cliente
          </button>
        </div>

        <NewClient
          showModal={showModal}
          onClose={() => setShowModal(false)}
        />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Clientes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
              <FiUsers className="text-red-500 text-lg" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes Totales</p>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-gray-400">
                Registrados en el sistema
              </p>
            </div>
          </div>

          {/* Bicicletas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaBicycle className="text-blue-500 text-lg" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bicicletas Totales</p>
              <p className="text-2xl font-bold text-blue-500">
                {totalBikes}
              </p>
              <p className="text-xs text-gray-400">En el registro</p>
            </div>
          </div>

          {/* Nuevos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <FiUserPlus className="text-green-600 text-lg" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nuevos Clientes</p>
              <p className="text-2xl font-bold text-green-600">
                {recentClients}
              </p>
              <p className="text-xs text-gray-400">
                Últimos 30 días
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {loadingBootstrap ? (
          <div>Cargando...</div>
        ) : clients.length === 0 ? (
          <div>No hay clientes registrados.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="grid grid-cols-3 px-6 py-4 text-xs font-semibold text-gray-400 border-b border-gray-100">
              <span>CLIENTE</span>
              <span>TELÉFONO</span>
              <span>BICICLETAS</span>
            </div>

            {/* Filas */}
            {paginatedClients.map((c) => {
              const initials = `${c.name[0]}${c.surname[0]}`;

              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/clientes/${c._id}`)}
                  className="grid grid-cols-3 items-center px-6 py-4 transition-all duration-150 hover:bg-gray-50 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer"
                >
                  {/* Cliente */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium">
                        {c.name} {c.surname}
                      </p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <FiPhone className="text-gray-400 text-sm" />
                    {c.mobileNum}
                  </div>

                  {/* Bicicletas */}
                  <div>
                    {c.bikes.length === 0 ? (
                      <span className="text-xs px-3 py-1 rounded-full border text-gray-500">
                        Sin bicicletas
                      </span>
                    ) : c.bikes.length === 1 ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaBicycle className="text-blue-500 text-sm" />
                        {c.bikes[0].brand} {c.bikes[0].model}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
                        <FaBicycle className="text-xs" />
                        {c.bikes.length} bicicletas
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Paginación PRO */}
            {(() => {
              const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
              const startItem =
                filteredClients.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1;
              const endItem = Math.min(
                currentPage * itemsPerPage,
                filteredClients.length
              );

              return (
                <div className="flex flex-col gap-3 px-6 py-5 border-t border-gray-200 bg-white sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-500">
                    Mostrando{" "}
                    <span className="font-semibold text-gray-800">
                      {startItem}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-gray-800">
                      {endItem}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-gray-800">
                      {filteredClients.length}
                    </span>{" "}
                    clientes
                  </p>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="text-lg">‹</span>
                      Anterior
                    </button>

                    <span className="text-sm font-medium text-gray-800">
                      {currentPage} de {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Siguiente
                      <span className="text-lg">›</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientList;
