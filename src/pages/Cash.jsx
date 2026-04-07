import Layout from "../components/Layout";
import { TfiStatsUp, TfiStatsDown } from "react-icons/tfi";
import {
  IoArrowUpCircleOutline,
  IoArrowDownCircleOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  getBalance,
  getFlows,
  createFlow,
  getFlowSummary,
} from "../services/cashService";
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
  const [totalItems, setTotalItems] = useState(0);

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
      }
    };

    fetchData();
  }, [loading, isAuthenticated]);

  const handleAddManualFlow = async () => {
    try {
      await createFlow({
        type,
        amount: Number(amount),
        description,
      });

      setCash(await getBalance());
      setSummary(await getFlowSummary());

      setType("");
      setAmount("");
      setDescription("");
      setShowModal(false);

      toast.success("Movimiento registrado");
    } catch (error) {
      toast.error("Error al registrar movimiento");
    }
  };

  const handleApplyDateFilter = async (page = 1) => {
    try {
      const params = { page, limit: 10 };
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const res = await getFlows(params);

      setFlow(res.items);
      setTotalPages(res.pages);
      setTotalItems(res.total);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Error filtrando movimientos");
    }
  };

  const formatCurrency = (value) =>
    value.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Caja</h1>
            <p className="text-gray-500">Control de ingresos y egresos</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white px-4 py-2 rounded-md cursor-pointer"
          >
            + Agregar movimiento
          </button>
        </div>

        {/* BALANCE */}
        <div className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white rounded-xl shadow-lg px-6 py-10">
          <p className="text-sm opacity-90">Dinero actual en caja</p>

          <h2 className="text-4xl font-bold mt-2">
            {formatCurrency(cash.balance)}
          </h2>

          <div className="flex gap-6 mt-4">
            <p className="flex items-center gap-2 text-sm">
              <TfiStatsUp /> + {formatCurrency(summary.today.ingresos)}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <TfiStatsDown /> - {formatCurrency(summary.today.egresos)}
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid sm:grid-cols-3 gap-4">
          {["today", "week", "month"].map((key, i) => {
            const titles = ["Hoy", "Esta semana", "Este mes"];
            const data = summary[key];
          
            return (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl border border-gray-300 p-5 shadow-sm"
              >
                <h3 className="text-sm text-gray-600 mb-4">{titles[i]}</h3>
            
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ingresos</span>
                    <span className="text-emerald-600 font-semibold">
                      + {formatCurrency(data.ingresos)}
                    </span>
                  </div>
            
                  <div className="flex justify-between">
                    <span className="text-gray-600">Egresos</span>
                    <span className="text-red-500 font-semibold">
                      - {formatCurrency(data.egresos)}
                    </span>
                  </div>
            
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="font-medium text-gray-700">Balance</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(data.balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            />
          </div>

          <button
            onClick={() => handleApplyDateFilter(1)}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium cursor-pointer"
          >
            Filtrar
          </button>
        </div>

        {/* HISTORIAL */}
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300">
          <div className="p-4">
            <h2 className="text-lg font-semibold">
              Historial de movimientos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-500 text-xs uppercase border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Monto</th>
                  <th className="px-6 py-3 text-left">Descripción</th>
                  <th className="px-6 py-3 text-left">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {flow.map((mov, idx) => (
                  <tr key={idx} className="border-b border-gray-300 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 flex items-center justify-center rounded-full ${
                            mov.type === "ingreso"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {mov.type === "ingreso" ? (
                            <IoArrowUpCircleOutline />
                          ) : (
                            <IoArrowDownCircleOutline />
                          )}
                        </div>
                        
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            mov.type === "ingreso"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {mov.type === "ingreso" ? "Ingreso" : "Egreso"}
                        </span>
                      </div>
                    </td>
                        
                    <td className="px-6 py-4 font-semibold">
                      <span
                        className={
                          mov.type === "ingreso"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }
                      >
                        {mov.type === "ingreso" ? "+" : "-"}{" "}
                        {formatCurrency(mov.amount)}
                      </span>
                    </td>
                      
                    <td className="px-6 py-4 text-gray-800">
                      {mov.description}
                    </td>
                      
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(mov.date).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {flow.length > 0 && (
            <div className="flex flex-col gap-3 px-6 py-5 border-t border-gray-200 bg-white sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-semibold text-gray-800">
                  {totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-gray-800">
                  {(currentPage - 1) * 10 + flow.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-800">
                  {totalItems}
                </span>{" "}
                movimientos
              </p>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => handleApplyDateFilter(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-lg">‹</span>
                  Anterior
                </button>

                <span className="text-sm font-medium text-gray-800">
                  {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => handleApplyDateFilter(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Siguiente
                  <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}
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
                className="border p-2 rounded-md"
              >
                <option value="">Seleccionar tipo</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>

              <input
                type="number"
                placeholder="Monto"
                className="border p-2 rounded-md"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <input
                type="text"
                placeholder="Descripción"
                className="border p-2 rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Cash;