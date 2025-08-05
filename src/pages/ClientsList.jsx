import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { fetchClients } from "../services/clientService";
import { useSearch } from '../context/SearchContext';
import { useNavigate } from "react-router-dom";

const ClientList = () => {
  const { searchTerm } = useSearch();
  const [clients, setClients] = useState([]);
  const [bikeCount, setBikeCount] = useState(0);
  const [recentClients, setRecentClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchClients(searchTerm);

        const now = new Date();
        const clientsWithBikes = await Promise.all(
          data.map(async (client) => {
            try {
              const res = await fetch(`http://localhost:4000/api/bikes?client_id=${client._id}`);
              const bikes = await res.json();
              return { ...client, bikes };
            } catch {
              return { ...client, bikes: [] };
            }
          })
        );

        const sortedClients = [...clientsWithBikes].sort((a, b) => {
          const nameA = `${a.name} ${a.surname}`.toLowerCase();
          const nameB = `${b.name} ${b.surname}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setClients(sortedClients);

        const totalBikes = clientsWithBikes.reduce((sum, c) => sum + c.bikes.length, 0);
        setBikeCount(totalBikes);

        const recent = clientsWithBikes.filter(c => {
          const created = new Date(c.createdAt);
          const diffDays = (now - created) / (1000 * 60 * 60 * 24);
          return diffDays <= 30;
        });

        setRecentClients(recent.length);
        setCurrentPage(1);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
}, [searchTerm]);

  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="p-8 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
            <h2>Clientes totales</h2>
            <p className="text-xl font-bold">{clients.length}</p>
            <p className="text-gray-600 text-sm">Registrados en el sistema</p>
          </div>
          <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
            <h2>Bicicletas totales</h2>
            <p className="text-xl font-bold text-blue-500">{bikeCount}</p>
            <p className="text-gray-600 text-sm">En el registro</p>
          </div>
          <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
            <h2>Nuevos clientes</h2>
            <p className="text-xl font-bold text-green-600">{recentClients}</p>
            <p className="text-gray-600 text-sm">En los últimos 30 días</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <Link
            to="/clientes/nuevo"
            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md"
          >
            + Agregar nuevo cliente
          </Link>
        </div>

        {loading ? (
          <div>Cargando...</div>
        ) : clients.length === 0 ? (
          <div>No hay clientes registrados.</div>
        ) : (
          <div>
            <table className="bg-white w-full">
              <thead className="text-gray-500 border-1 border-gray-300">
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
                    <td className="py-4 px-2">{c.name} {c.surname}</td>
                    <td className="py-4 px-2">{c.mobileNum}</td>
                    <td className="py-4 px-2">
                      {c.bikes.length === 0
                        ? "Sin bicicletas"
                        : c.bikes.length === 1
                        ? `${c.bikes[0].brand} ${c.bikes[0].model}`
                        : `${c.bikes.length} bicicletas`
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center w-full gap-4 items-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 text-white cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-md">Página {currentPage}</span>
              <button
                onClick={() =>
                  setCurrentPage(prev =>
                    prev * itemsPerPage < clients.length ? prev + 1 : prev
                  )
                }
                disabled={currentPage * itemsPerPage >= clients.length}
                className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 text-white cursor-pointer"
              >
                Siguiente
              </button>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientList;


