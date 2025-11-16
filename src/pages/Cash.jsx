import Layout from "../components/Layout";
import { TfiStatsUp, TfiStatsDown } from "react-icons/tfi";
import {
  IoArrowUpCircleOutline,
  IoArrowDownCircleOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import { getBalance, getFlows, createFlow, getFlowSummary } from "../services/cashService";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Cash = () => {
  const [cash, setCash] = useState({ balance: 0 });
  const [flow, setFlow] = useState([]);
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const [summary, setSummary] = useState({
    today: { ingresos: 0, egresos: 0, balance: 0 },
    week: { ingresos: 0, egresos: 0, balance: 0 },
    month: { ingresos: 0, egresos: 0, balance: 0 },
  });

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setCash(await getBalance());
        setSummary(await getFlowSummary());
      } catch (error) {
        toast.error("Error cargando datos");
        console.error(error);
      }
    };

    fetchData();
  }, [loading, isAuthenticated]);


  const handleAddManualFlow = async () => {
    try {
      await createFlow({
        type,
        amount: Number(amount),
        description
      });

      setCash(await getBalance());
      setSummary(await getFlowSummary());

      setType("");
      setAmount("");
      setDescription("");
      setShowModal(false);

      toast.success("Movimiento registrado");
    } catch (error) {
      toast.alert("Error al registrar movimiento");
      console.error("Error registering flow: ", error);
    }
  };

  const handleApplyDateFilter = async (page = 1) => {
    try {
      const params = {
        page,
        limit: 10,
      };

      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const res = await getFlows(params);

      setFlow(res.items);
      setTotalPages(res.pages);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Error filtrando movimientos");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="p-4 flex flex-col gap-4">
        
        {/* Tarjeta principal */}
        <div className="flex flex-col bg-red-500 rounded-md shadow-xl h-40 text-white justify-between py-4 px-6">
          <h2 className="text-xl">Dinero actual en caja</h2>

          <p className="text-4xl font-bold">
            ${cash.balance.toLocaleString("es-AR")}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <p className="flex gap-2 items-center">
              <TfiStatsUp className="w-5 h-5" />+ $
              {summary.today.ingresos.toLocaleString("es-AR")} hoy
            </p>
            <p className="flex gap-2 items-center">
              <TfiStatsDown className="w-5 h-5" />- $
              {summary.today.egresos.toLocaleString("es-AR")} hoy
            </p>
          </div>
        </div>

        {/* RESUMEN GENERAL */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

  {/* HOY */}
  <div className="p-4 bg-white rounded-md shadow border">
    <h3 className="text-lg font-semibold mb-1">Hoy</h3>
    <p className="text-green-600 font-bold">
      + ${summary.today.ingresos.toLocaleString("es-AR")} ingresos
    </p>
    <p className="text-red-600 font-bold">
      - ${summary.today.egresos.toLocaleString("es-AR")} egresos
    </p>
    <p className="text-gray-800 font-bold mt-1">
      Balance: ${summary.today.balance.toLocaleString("es-AR")}
    </p>
  </div>

  {/* ESTA SEMANA */}
  <div className="p-4 bg-white rounded-md shadow border">
    <h3 className="text-lg font-semibold mb-1">Esta semana</h3>
    <p className="text-green-600 font-bold">
      + ${summary.week.ingresos.toLocaleString("es-AR")} ingresos
    </p>
    <p className="text-red-600 font-bold">
      - ${summary.week.egresos.toLocaleString("es-AR")} egresos
    </p>
    <p className="text-gray-800 font-bold mt-1">
      Balance: ${summary.week.balance.toLocaleString("es-AR")}
    </p>
  </div>

  {/* ESTE MES */}
  <div className="p-4 bg-white rounded-md shadow border">
    <h3 className="text-lg font-semibold mb-1">Este mes</h3>
    <p className="text-green-600 font-bold">
      + ${summary.month.ingresos.toLocaleString("es-AR")} ingresos
    </p>
    <p className="text-red-600 font-bold">
      - ${summary.month.egresos.toLocaleString("es-AR")} egresos
    </p>
    <p className="text-gray-800 font-bold mt-1">
      Balance: ${summary.month.balance.toLocaleString("es-AR")}
    </p>
  </div>

</div>


        {/* FILTROS DE FECHA */}
        <div className="flex gap-4 bg-gray-200 p-4 rounded-md">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-md"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-md"
          />

          <button
            className="bg-red-500 text-white p-2 rounded-md cursor-pointer"
            onClick={() => handleApplyDateFilter(1)}
          >
            Filtrar
          </button>
        </div>

        {/* HISTORIAL */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold">Historial de movimientos</h2>

            <button
              className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              + Agregar movimiento manualmente
            </button>
          </div>

          {/* MODAL */}
          {showModal && (
            <Modal
              title="Movimiento manual"
              onClose={() => setShowModal(false)}
              onConfirm={handleAddManualFlow}
              confirmText="Confirmar"
              cancelText="Cancelar"
              disableConfirm={!type || !amount || !description}
            >
              <div className="flex flex-col gap-4">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>

                <input
                  type="number"
                  placeholder="Monto"
                  className="border p-2 rounded"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Descripción"
                  className="border p-2 rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </Modal>
          )}

          {/* TABLA */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="text-gray-500 bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Monto</th>
                  <th className="px-4 py-2 text-left">Descripción</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {flow.map((mov, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">
                      {mov.type === "ingreso" ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <IoArrowUpCircleOutline />
                          Ingreso
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <IoArrowDownCircleOutline />
                          Egreso
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      ${mov.amount.toLocaleString("es-AR")}
                    </td>

                    <td className="px-4 py-2">{mov.description}</td>

                    <td className="px-4 py-2">
                      {new Date(mov.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {flow.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={() => handleApplyDateFilter(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-red-500 text-white disabled:opacity-50 cursor-pointer"
              >
                Anterior
              </button>

              <span className="text-md">Página {currentPage}</span>

              <button
                onClick={() => handleApplyDateFilter(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-red-500 text-white disabled:opacity-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cash;
