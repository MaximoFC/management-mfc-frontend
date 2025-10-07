import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getActiveWarranties } from "../services/budgetService";

const Warranties = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWarranties = async () => {
            try {
                const data = await getActiveWarranties();
                setBudgets(data);
            } catch (err) {
                console.error("Error fetching warranties", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWarranties();
    }, []);

    const now = new Date();

    return (
        <Layout>
            <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Garantías activas</h1>

            {loading ? (
                <p>Cargando garantías...</p>
            ) : !budgets.length ? (
                <p>No hay garantías activas</p>
            ) : (
                budgets.map((budget) => (
                <div
                    key={budget._id}
                    className="border rounded-lg p-4 mb-4 shadow-sm bg-white"
                >
                <p className="font-semibold">
                    Cliente: {budget.bike_id?.current_owner_id?.name} {budget.bike_id?.current_owner_id?.surname}
                </p>
                <p>
                    Bicicleta: {budget.bike_id?.brand} {budget.bike_id?.model}
                </p>

                <div className="mt-3">
                    {budget.services
                        .filter((s) => s.warranty?.status === "activa")
                        .map((s) => {
                            //Cálculo de revisiones
                            const nextCheckup = s.warranty.checkups?.find((c) => !c.completed);
                            let warning = "";
                            if (nextCheckup) {
                                const diffDays = Math.ceil(
                                    (new Date(nextCheckup.date) - now) / (1000 * 60 * 60 * 24)
                                );
                                if (diffDays <= 7 && diffDays >= 0) {
                                    warning = `⚠️ Revisión en ${diffDays} días`;
                                }
                            }

                            return (
                                <div
                                    key={s.service_id}
                                    className="p-3 border rounded mt-2 bg-gray-50"
                                >
                                    <p className="font-medium">{s.name}</p>
                                    <p>
                                        Garantía: {new Date(s.warranty.startDate).toLocaleDateString()}{" "}
                                        → {new Date(s.warranty.endDate).toLocaleDateString()}
                                    </p>
                                    {warning && (
                                        <p className="text-red-500 font-semibold">{warning}</p>
                                    )}

                                    <Link
                                        to={`/garantias/${budget._id}`}
                                        className="mt-2 inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Ver detalle
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))
            )}
        </div>
        </Layout>
    );
};

export default Warranties;
