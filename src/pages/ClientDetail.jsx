import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ClientBikesModal from "../components/ClientBikesModal";
import EditBikeModal from "../components/EditBikeModal";
import { FiEdit2 } from "react-icons/fi";
import { useInventoryStore } from "../store/useInventoryStore";
import { updateClient as updateClientService, fetchClientById } from "../services/clientService";
import { fetchBudgetsByClient } from "../services/budgetService"; // traer presupuestos
import { formatARS, getServicePriceARS } from "../components/budgetPricing";
import { LoadingDots } from "../components/ui-primitives";

const ITEMS_PER_PAGE = 5;

const ClientDetail = () => {
  const { id } = useParams();
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
  const [editingBike, setEditingBike] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Cargar solo este cliente (no la lista completa) ---
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchClientById(id)
      .then(({ client: c, bikes }) => {
        if (!active) return;
        setClient({ ...c, bikes });
        setEditName(c.name);
        setEditSurname(c.surname);
        setEditMobileNum(c.mobileNum);
      })
      .catch(() => active && setError("Cliente no encontrado"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // --- Seleccionar primera bicicleta por defecto ---
  useEffect(() => {
    if (client && client.bikes.length > 0 && !selectedBike) {
      setSelectedBike(client.bikes[0]._id);
    }
  }, [client, selectedBike]);

  // --- Cargar presupuestos del cliente ---
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!client) return;

      try {
        setLoading(true);
        const budgetsData = await fetchBudgetsByClient(client._id);
        setBudgets(budgetsData);
      } catch (e) {
        setError(e.message || "Error cargando presupuestos");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar de cliente, no al agregar bicis
  }, [client?._id]);

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

  // --- Filtrado y paginación de presupuestos ---
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
          {saving ? <LoadingDots /> : "Guardar cambios"}
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
          <div className="mt-4 flex flex-wrap gap-2">
            {clientBikes.map((bike) => (
              <div
                key={bike._id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedBike(bike._id);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSelectedBike(bike._id);
                    setCurrentPage(1);
                  }
                }}
                className={`relative flex flex-col items-start p-4 rounded-lg shadow-md border w-56 text-left transition cursor-pointer ${
                  selectedBike === bike._id
                    ? "border-b-2 border-red-500 font-semibold"
                    : "text-gray-600"
                }`}
              >
                <button
                  type="button"
                  aria-label={`Editar ${bike.brand} ${bike.model}`}
                  title="Editar bicicleta"
                  className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBike(bike);
                  }}
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <h4 className="pr-6">
                  {bike.brand} {bike.model} {bike.color && `(${bike.color})`}
                </h4>
                <p className="mt-1 text-xs font-normal text-gray-500">
                  {bike.serialNumber ? `N° de serie: ${bike.serialNumber}` : "Sin número de serie"}
                </p>
                <p
                  className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    bike.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {bike.active ? "Activa" : "Deshabilitada"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* --- Historial de presupuestos --- */}
        <div className="mt-4">
          {filteredBudgets.length === 0 ? (
            <p className="text-sm text-gray-500">Sin historial de arreglos</p>
          ) : (
            <ul className="space-y-4">
              {paginatedBudgets.map((item) => (
                <li
                  key={item._id}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {new Date(item.creation_date).toLocaleDateString("es-AR")}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.state === "retirado"
                          ? "bg-green-100 text-green-700"
                          : item.state === "en proceso"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.state.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>Cotización usada:</strong> $
                      {item.dollar_rate_used}
                    </p>
                    <p>
                      <strong>Total USD:</strong> ${item.total_usd} |{" "}
                      <strong>Total ARS:</strong> ${item.total_ars}
                    </p>
                  </div>

                  {/* Servicios */}
                  {item.services?.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800 mb-1">
                        Servicios realizados:
                      </p>
                      <ul className="ml-4 list-disc text-sm text-gray-700">
                        {item.services.map((service, i) => (
                          <li key={i} className="mb-1">
                            {service.name} - {formatARS(getServicePriceARS(service, item.dollar_rate_used))}
                            {service.warranty?.hasWarranty && (
                              <span className="ml-2 text-xs text-blue-600">
                                Garantía activa hasta{" "}
                                {new Date(
                                  service.warranty.endDate
                                ).toLocaleDateString("es-AR")}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Repuestos */}
                  {item.parts?.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800 mb-1">
                        Repuestos utilizados:
                      </p>
                      <ul className="ml-4 list-disc text-sm text-gray-700">
                        {item.parts.map((part, i) => (
                          <li key={i}>
                            {part.description} x{part.amount} ({part.currency} {part.unit_price})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Empleado */}
                  {item.employee_id && (
                    <p className="text-sm text-gray-500 mt-3">
                      <strong>Técnico:</strong> {item.employee_id.name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          {totalPage > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 cursor-pointer text-white"
              >
                Anterior
              </button>
              <span className="text-md">
                Página {currentPage} de {totalPage}
              </span>
              <button
                disabled={currentPage === totalPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 cursor-pointer text-white"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {editingBike && (
          <EditBikeModal
            bike={editingBike}
            onClose={() => setEditingBike(null)}
            onSaved={(updated) =>
              setClient((c) => ({ ...c, bikes: c.bikes.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)) }))
            }
          />
        )}

        {showModal && (
          <ClientBikesModal
            client={client}
            onBikeAdded={(bike) => setClient((c) => ({ ...c, bikes: [...(c.bikes || []), bike] }))}
            closeModal={() => setShowModal(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientDetail;
