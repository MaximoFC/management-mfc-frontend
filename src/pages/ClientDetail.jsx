import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ClientBikesModal from "../components/ClientBikesModal";
import { updateClient, fetchClientById } from "../services/clientService";
import { fetchBudgetsByClient } from "../services/budgetService";

const ITEMS_PER_PAGE = 5;

const ClientDetail = () => {
    const { id } = useParams();

    const [client, setClient] = useState(null);
    const [bikes, setBikes] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editName, setEditName] = useState('');
    const [editSurname, setEditSurname] = useState('');
    const [editMobileNum, setEditMobileNum] = useState('');
    const [saving, setSaving] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedBike, setSelectedBike] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch cliente + bicicletas
    const fetchData = async () => {
        try {
            setLoading(true);
            const { client, bikes } = await fetchClientById(id);
            const budgetsData = await fetchBudgetsByClient(id);

            setClient(client);
            setBikes(bikes);
            setBudgets(budgetsData);

            setEditName(client.name);
            setEditSurname(client.surname);
            setEditMobileNum(client.mobileNum);

            if (!selectedBike && bikes.length > 0) {
                setSelectedBike(bikes[0]._id);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            await updateClient(id, {
                name: editName,
                surname: editSurname,
                mobileNum: editMobileNum
            });
            await fetchData();
        } catch (e) {
            setError(e.message || "Error cargando datos del cliente");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div>Cargando...</div></Layout>;
    if (error) return <Layout><div className="text-red-500">Error: {error}</div></Layout>;
    if (!client) return <Layout><div>No se encontró el cliente</div></Layout>;

    const filteredBudgets = budgets
        .filter(b => b.bike_id?._id === selectedBike)
        .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));

    const totalPage = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBudgets = filteredBudgets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Layout>
            <div className="p-8 flex flex-col gap-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold">
                    <input
                        className="text-xl font-bold border-b border-gray-400 focus:outline-none focus:border-red-500"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                    />{" "}
                    <input
                        className="text-xl font-bold border-b border-gray-400 focus:outline-none focus:border-red-500"
                        value={editSurname}
                        onChange={e => setEditSurname(e.target.value)}
                    />
                </h2>
                <p>
                    Teléfono:{" "}
                    <input
                        className="border-b border-gray-400 focus:outline-none focus:border-red-500"
                        value={editMobileNum}
                        onChange={e => setEditMobileNum(e.target.value)}
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

                {bikes.length === 0 ? (
                    <p className="text-gray-600">Sin bicicletas registradas.</p>
                ) : (
                    <div className="mt-4">
                        <div className="flex gap-2">
                            {bikes.map(bike => (
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

                        <div className="mt-4">
                            {filteredBudgets.length === 0 ? (
                                <p className="text-sm text-gray-500">Sin historial de arreglos</p>
                            ) : (
                                <ul className="space-y-2">
                                    {paginatedBudgets.map(item => (
                                        <li
                                            key={item._id}
                                            className="text-sm text-gray-700 border rounded-md p-3 shadow-sm bg-gray-50"
                                        >
                                            <p>{new Date(item.creation_date).toLocaleDateString()}</p>
                                            <p>Cotización utilizada: ${item.dollar_rate_used || 0}</p>
                                            <p>Total en dólares: ${item.total_usd || 0}</p>
                                            <p>Total en pesos: ${item.total_ars || 0} (Services + repuestos)</p>
                                            <p>Estado: {item.state}</p>

                                            {item.services?.length > 0 && (
                                                <ul>
                                                    {item.services.map(service => (
                                                        <li>
                                                            {service.name} - ${service.price_usd}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {totalPage > 1 && (
                                <div className="flex gap-2 mt-4 justify-center">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 cursor-pointer text-white"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-md">Página {currentPage} de {totalPage}</span>
                                    <button
                                        disabled={currentPage === totalPage}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 cursor-pointer text-white"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showModal && (
                    <ClientBikesModal
                        client={client}
                        closeModal={() => {
                            setShowModal(false);
                            fetchData(); // Refrescar datos tras cerrar modal
                        }}
                    />
                )}
            </div>
        </Layout>
    );
};

export default ClientDetail;
