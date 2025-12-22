import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSearch } from "../context/SearchContext";
import NewClient from "./NewClient";
import { useInventoryStore } from "../store/useInventoryStore";

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
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Clientes totales</h2>
            <p className="text-xl font-bold">{clients.length}</p>
            <p className="text-gray-600 text-sm">Registrados en el sistema</p>
          </div>
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Bicicletas totales</h2>
            <p className="text-xl font-bold text-blue-500">{totalBikes}</p>
            <p className="text-gray-600 text-sm">En el registro</p>
          </div>
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Nuevos clientes</h2>
            <p className="text-xl font-bold text-green-600">{recentClients}</p>
            <p className="text-gray-600 text-sm">En los últimos 30 días</p>
          </div>
        </div>

        {/* Botón para agregar cliente */}
        <div className="flex justify-start">
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full sm:w-auto text-center cursor-pointer"
          >
            + Agregar nuevo cliente
          </button>
          <NewClient
            showModal={showModal}
            onClose={() => setShowModal(false)}
          />
        </div>

        {/* Tabla o mensaje */}
        {loadingBootstrap ? (
          <div>Cargando...</div>
        ) : clients.length === 0 ? (
          <div>No hay clientes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="bg-white w-full min-w-[600px]">
              <thead className="text-gray-500 border border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre completo</th>
                  <th className="px-4 py-2 text-left">Teléfono</th>
                  <th className="px-4 py-2 text-left">Bicicletas</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/clientes/${c._id}`)}
                  >
                    <td className="py-4 px-2">
                      {c.name} {c.surname}
                    </td>
                    <td className="py-4 px-2">{c.mobileNum}</td>
                    <td className="py-4 px-2">
                      {c.bikes.length === 0
                        ? "Sin bicicletas"
                        : c.bikes.length === 1
                        ? `${c.bikes[0].brand} ${c.bikes[0].model}`
                        : `${c.bikes.length} bicicletas`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mt-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 text-white cursor-pointer"
                >
                  Anterior
                </button>
                <span className="text-md">Página {currentPage}</span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev * itemsPerPage < filteredClients.length
                        ? prev + 1
                        : prev
                    )
                  }
                  disabled={
                    currentPage * itemsPerPage >= filteredClients.length
                  }
                  className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 text-white cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientList;
