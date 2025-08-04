import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ClientBikesModal from "../components/ClientBikesModal";

const ClientDetail = () => {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch cliente + bicicletas
  const fetchClientData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/clients/${id}`);
      if (!res.ok) throw new Error("Error al obtener el cliente");
      const data = await res.json();
      setClient(data.client);

      // Si tu endpoint /api/clients/:id incluye "bikes" también, usalo así:
      if (data.bikes) setBikes(data.bikes);
      else {
        // Si no, buscar bicis por separado
        const resBikes = await fetch(`http://localhost:4000/api/bikes?client_id=${id}`);
        const bikesData = await resBikes.json();
        setBikes(bikesData);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  if (loading) return <Layout><div>Cargando...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">Error: {error}</div></Layout>;
  if (!client) return <Layout><div>No se encontró el cliente</div></Layout>;

  return (
    <Layout>
      <div className="p-8 flex flex-col gap-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold">
          {client.name} {client.surname}
        </h2>
        <p>Teléfono: {client.mobileNum}</p>
        <p>Registrado el {new Date(client.createdAt).toLocaleDateString()}</p>

        <div className="mt-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Bicicletas</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-700 text-white p-2 px-4 rounded-md"
          >
            + Agregar bicicleta
          </button>
        </div>

        {bikes.length === 0 ? (
          <p className="text-gray-600">Sin bicicletas registradas.</p>
        ) : (
          bikes.map(bike => (
            <div key={bike._id} className="border rounded p-4 mt-4 bg-white shadow">
              <h3 className="text-lg font-semibold">{bike.brand} {bike.model} ({bike.color})</h3>
              <p>Estado: {bike.active ? "Activa" : "Deshabilitada"}</p>

              <h4 className="mt-2 font-medium">Historial de arreglos</h4>
              {bike.history?.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {bike.history.map((item) => (
                    <li key={item._id} className="text-sm text-gray-700">
                      <p>📅 {new Date(item.createdAt).toLocaleDateString()}</p>
                      <p>📝 {item.description || "Sin descripción"}</p>
                      <p>💵 ${item.price || 0}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin historial de arreglos</p>
              )}
            </div>
          ))
        )}

        {showModal && (
          <ClientBikesModal
            client={client}
            closeModal={() => {
              setShowModal(false);
              fetchClientData(); // Refrescar datos tras cerrar modal
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientDetail;
