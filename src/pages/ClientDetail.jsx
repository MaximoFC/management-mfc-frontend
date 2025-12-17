import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ClientBikesModal from "../components/ClientBikesModal";
import { useInventoryStore } from "../store/useInventoryStore";
import { updateClient as updateClientService } from "../services/clientService";

const ITEMS_PER_PAGE = 5;

const ClientDetail = () => {
  const { id } = useParams();
  const clients = useInventoryStore((state) => state.clients);
  const postUpdateClient = useInventoryStore((state) => state.updateClient);

  const [client, setClient] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editMobileNum, setEditMobileNum] = useState("");
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Cargar cliente ---
  useEffect(() => {
    if (!clients || clients.length === 0) return;

    const c = clients.find((cl) => cl._id === id);
    if (!c) {
      setError("Cliente no encontrado");
      setLoading(false);
      return;
    }

    setClient(c);
    setEditName(c.name);
    setEditSurname(c.surname);
    setEditMobileNum(c.mobileNum);

    setLoading(false);
  }, [id, clients]);

  // --- Seleccionar la primera bicicleta por defecto ---
  useEffect(() => {
    if (client && client.bikes.length > 0 && !selectedBike) {
      setSelectedBike(client.bikes[0]._id);
    }
  }, [client, selectedBike]);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updated = await updateClientService(client._id, {
        name: editName,
        surname: editSurname,
        mobileNum: editMobileNum,
      });
      postUpdateClient(updated);
      setClient(updated);
    } catch (e) {
      setError(e.message || "Error actualizando cliente");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div>Cargando...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="text-red-500">Error: {error}</div>
      </Layout>
    );
  if (!client)
    return (
      <Layout>
        <div>No se encontró el cliente</div>
      </Layout>
    );

  const clientBikes = client.bikes || [];

  // --- Presupuestos filtrados y paginación ---
  const filteredBudgets = budgets
    .filter((b) => b.bike_id?._id === selectedBike)
    .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));

  const totalPage = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBudgets = filteredBudgets.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <div className="p-8 flex flex-col gap-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold">
          <input
            className="text-xl font-bold border-b border-gray-400 focus:outline-none focus:border-red-500"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />{" "}
          <input
            className="text-xl font-bold border-b border-gray-400 focus:outline-none focus:border-red-500"
            value={editSurname}
            onChange={(e) => setEditSurname(e.target.value)}
          />
        </h2>
        <p>
          Teléfono:{" "}
          <input
            className="border-b border-gray-400 focus:outline-none focus:border-red-500"
            value={editMobileNum}
            onChange={(e) => setEditMobileNum(e.target.value)}
          />
        </p>

        <button
          className="bg-red-500 hover:bg-red-700 text-white p-2 px-4 rounded-md cursor-pointer mt-6"
          onClick={handleSaveChanges}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <div className="mt-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Bicicletas</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-700 text-white p-2 px-4 rounded-md cursor-pointer"
          >
            + Agregar bicicleta
          </button>
        </div>

        {clientBikes.length === 0 ? (
          <p className="text-gray-600">Sin bicicletas registradas.</p>
        ) : (
          <div className="mt-4 flex gap-2">
            {clientBikes.map((bike) => (
              <button
                key={bike._id}
                onClick={() => {
                  setSelectedBike(bike._id);
                  setCurrentPage(1);
                }}
                className={`flex flex-col items-start p-4 rounded-lg shadow-md border w-56 text-left transition cursor-pointer ${
                  selectedBike === bike._id
                    ? "border-b-2 border-red-500 font-semibold"
                    : "text-gray-600"
                }`}
              >
                <h4>
                  {bike.brand} {bike.model} ({bike.color})
                </h4>
                <p
                  className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    bike.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {bike.active ? "Activa" : "Deshabilitada"}
                </p>
              </button>
            ))}
          </div>
        )}

        {showModal && (
          <ClientBikesModal
            client={client}
            closeModal={() => setShowModal(false)}
          />
        )}

        {/* Aquí podrías renderizar la paginación de presupuestos usando paginatedBudgets */}
      </div>
    </Layout>
  );
};

export default ClientDetail;
