import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchBudgets, updateBudgetState } from "../services/budgetService";
import axios from "axios";

const STATES = ["iniciado", "en proceso", "terminado", "pagado", "retirado"];
const STATE_LABELS = {
  "iniciado": "Iniciado",
  "en proceso": "En proceso",
  "terminado": "Terminado",
  "pagado": "Pagado",
  "retirado": "Retirado",
};

const STATE_COLORS = {
  "iniciado": "bg-blue-100 border-blue-300 text-blue-600",
  "en proceso": "bg-yellow-100 border-yellow-300 text-yellow-600",
  "terminado": "bg-green-100 border-green-300 text-green-600",
  "pagado": "bg-purple-100 border-purple-300 text-purple-600",
  "retirado": "bg-gray-100 border-gray-300 text-gray-600"
};

const WorkList = () => {
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingPickup: 0,
    toCharge: 0
  });
  const [columns, setColumns] = useState({
    iniciado: [],
    "en proceso": [],
    terminado: [],
    pagado: [],
    retirado: []
  });

  useEffect(() => {
    fetchBudgets().then(budgets => {
      const grouped = { iniciado: [], "en proceso": [], terminado: [], pagado: [], retirado: [] };
      let todayCount = 0;
      let pendingPickup = 0;
      let toCharge = 0;

      const now = new Date();
      budgets.forEach(budget => {
        if (grouped[budget.state]) grouped[budget.state].push(budget);

        const created = new Date(budget.creation_date);
        if ((now - created) / (1000 * 60 * 60) < 24) {
          todayCount++;
        }

        if (budget.state === "terminado") {
          toCharge += budget.total_ars;
        }

        if (budget.state === "terminado" || budget.state === "pagado") {
          pendingPickup++;
        }
      });

      setColumns(grouped);
      setStats({ todayCount, pendingPickup, toCharge });
    });
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId;
    const to = destination.droppableId;

    const movedBudget = columns[from].find(b => b._id === draggableId);

    if (to === 'pagado') {
      try {
        await axios.post('http://localhost:4000/api/cash/flow', {
          type: 'ingreso',
          amount: Number(movedBudget.total_ars),
          description: `Cobro de presupuesto de ${movedBudget.bike_id?.current_owner_id?.name || '-'} ${movedBudget.bike_id?.current_owner_id?.surname || '-'}`
        });
      } catch (error) {
        console.error("Error creating cash flow:", error.message);
      }
    }

    // Update backend
    await updateBudgetState(movedBudget._id, { state: to });

    // Actualizar columnas (en un solo set)
    setColumns(prev => {
      const updated = {...prev};
      updated[from] = [...updated[from]];
      updated[from].splice(source.index, 1);
      updated[to] = [...updated[to], {...movedBudget, state: to}];
      return updated;
    });

    // Actualizar estadísticas
    setStats(prev => {
      let newToCharge = prev.toCharge;
      let newPendingPickup = prev.pendingPickup;

      if (from === "terminado") {
        newToCharge -= Number(movedBudget.total_ars) || 0;
      }
      if (to === "terminado") {
        newToCharge += Number(movedBudget.total_ars) || 0;
      }

      if ((from === 'terminado' || from === 'pagado') && !(to === 'terminado' || to === 'pagado')) {
        newPendingPickup--;
      }
      if (!(from === 'terminado' || from === 'pagado') && (to === 'terminado' || to === 'pagado')) {
        newPendingPickup++;
      }

      return {
        ...prev,
        toCharge: newToCharge,
        pendingPickup: newPendingPickup
      };
    });
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Trabajos hoy</h2>
            <p className="text-xl font-bold">{stats.todayCount}</p>
            <p className="text-gray-600 text-sm">Ingresados en las últimas 24h</p>
          </div>
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Pendientes de retiro</h2>
            <p className="text-xl font-bold text-blue-500">{stats.pendingPickup}</p>
            <p className="text-gray-600 text-sm">Contando estadía</p>
          </div>
          <div className="border border-gray-300 rounded-md py-4 px-6 bg-white">
            <h2 className="text-base font-semibold">Por cobrar</h2>
            <p className="text-xl font-bold text-green-600">${stats.toCharge.toLocaleString("es-AR")}</p>
            <p className="text-gray-600 text-sm">Trabajos terminados</p>
          </div>
        </div>

      <div className="flex gap-4 p-2 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATES.filter(s => s!=="retirado").map(state => (
            <Droppable key={state} droppableId={state}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg p-4 w-72 min-w-[150px] max-w-sm shadow flex flex-col border-3 border-dashed ${STATE_COLORS[state]}`}
                >
                  <h3 className="font-bold text-base mb-2">{STATE_LABELS[state]}</h3>
                  {columns[state].map((budget, idx) => (
                    <Draggable key={budget._id} draggableId={budget._id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 p-3 bg-white rounded-md shadow-sm border border-gray-200 text-black 
                            select-none cursor-grab active:cursor-grabbing
                            ${snapshot.isDragging ? "ring-2 ring-red-300" : ""
                          }`}
                        >
                          <div className="font-semibold">
                            {budget.bike_id?.current_owner_id?.name || "-"} {budget.bike_id?.current_owner_id?.surname || "-"}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {budget.bike_id?.brand} {budget.bike_id?.model}
                          </div>
                          <div className="mb-1">
                            <span className="font-bold">Servicios:</span>
                            <ul className="ml-2 list-disc text-xs">
                              {(budget.services || []).map((s, i) => (
                                <li key={i}>
                                  {s.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-bold">Partes:</span>
                            <ul className="ml-2 list-disc text-xs">
                              {(budget.parts || []).map((p, i) => (
                                <li key={i}>
                                  {p.bikepart_id?.description} (x{p.amount})
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2 font-bold text-green-700">
                            Total: ${(budget.total_ars ?? 0).toLocaleString("es-AR")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ingresó el {new Date(budget.creation_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}

          {/* Zona de retiro */}
          <Droppable droppableId="retirado">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex items-center justify-center 
                  w-12 min-w-[48px] h-40 self-start 
                  rounded-md border-2 border-dashed
                  ${snapshot.isDraggingOver ? "bg-gray-300 border-gray-500" : "bg-gray-200 border-gray-400"
                }`}
              >
                <span 
                  className="text-sm font-semibold text-gray-700"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap"
                  }}
                >
                    Retirado
                </span>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      </div>
    </Layout>
  );
};

export default WorkList;
