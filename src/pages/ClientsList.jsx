import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { fetchClients } from "../services/clientService";
import { useSearch } from '../context/SearchContext';
import ClientBikesModal from "../components/ClientBikesModal";

const ClientList = () => {
  const { searchTerm } = useSearch();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalClient, setModalClient] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchClients(searchTerm)
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchTerm]);

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link
          to="/clientes/nuevo"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-bold mr-6 shadow"
        >
          + Nuevo
        </Link>
        <h2 className="text-xl font-semibold">Listado de clientes</h2>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : clients.length === 0 ? (
        <div>No hay clientes registrados.</div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Apellido</th>
                <th className="py-3 px-4 text-left">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setModalClient(c)}
                >
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4">{c.surname}</td>
                  <td className="py-3 px-4">{c.mobileNum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Bicicletas */}
      {modalClient && (
        <ClientBikesModal
          client={modalClient}
          closeModal={() => setModalClient(null)}
        />
      )}
    </Layout>
  );
};

export default ClientList;


