import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const BudgetDetail = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/budgets/${id}`);
        setBudget(res.data);
        console.log(res.data.bike_id);
      } catch (err) {
        console.error("Error fetching budget", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, [id]);

  const handleCheckupComplete = async (serviceId, checkupDate) => {
    try {
      const res = await axios.put(`http://localhost:4000/api/budgets/${id}`, {
        action: "completeCheckup",
        serviceId,
        checkupDate,
      });
      setBudget(res.data);
    } catch (err) {
      console.error("Error updating checkup", err);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!budget) return <p>No se encontró el presupuesto.</p>;

  return (
    <Layout>
      <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Presupuesto</h1>

      {/* Info básica */}
      <p><strong>Cliente:</strong> {budget.bike_id?.current_owner_id?.name} {budget.bike_id?.current_owner_id?.surname}</p>
      <p><strong>Bicicleta:</strong> {budget.bike_id?.brand} {budget.bike_id?.model}</p>
      <p><strong>Total (USD):</strong> {budget.total_usd}</p>
      <p><strong>Total (ARS):</strong> {budget.total_ars}</p>
      <p><strong>Estado:</strong> {budget.state}</p>

      <h2 className="text-xl font-semibold mt-6">Servicios</h2>
      {budget.services.map((s) => (
        <div key={s._id} className="border rounded p-3 my-2">
          <p><strong>{s.name}</strong> - {s.description}</p>
          <p>Precio: {s.price_usd} USD</p>

          {s.warranty?.hasWarranty && (
            <div className="mt-2 bg-gray-100 p-2 rounded">
              <p className="font-medium">Garantía activa ✅</p>
              <p>Desde: {new Date(s.warranty.startDate).toLocaleDateString()}</p>
              <p>Hasta: {new Date(s.warranty.endDate).toLocaleDateString()}</p>

              <h3 className="mt-2 font-semibold">Revisiones</h3>
              {s.warranty.checkups?.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 border rounded mt-1">
                  <p>
                    Revisión en: {new Date(c.date).toLocaleDateString()} —{" "}
                    {c.completed ? "✔️ Completada" : "⏳ Pendiente"}
                  </p>
                  {!c.completed && (
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleCheckupComplete(s.service_id, c.date)}
                    >
                      Marcar como hecha
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6">Repuestos</h2>
      {budget.parts.map((p) => (
        <div key={p._id} className="border rounded p-3 my-2">
          <p>{p.description}</p>
          <p>Cantidad: {p.amount}</p>
          <p>Subtotal: {p.subtotal_usd} USD</p>
        </div>
      ))}
    </div>
    </Layout>
  );
};

export default BudgetDetail;
