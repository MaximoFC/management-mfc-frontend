import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchBudgets, updateBudgetState } from "../services/budgetService";

const STATES = ["iniciado", "en proceso", "terminado", "pagado", "retirado"];
const STATE_LABELS = {
  "iniciado": "Iniciado",
  "en proceso": "En proceso",
  "terminado": "Terminado",
  "pagado": "Pagado",
  "retirado": "Retirado",
};

const WorkList = () => {
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
      budgets.forEach(budget => {
        if (grouped[budget.state]) grouped[budget.state].push(budget);
      });
      setColumns(grouped);
    });
  }, []);

  const onDragEnd = async (result) => {
    console.log("Drag result:", result);
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    const moved = [...columns[from]];
    const [item] = moved.splice(source.index, 1);

    // Update backend
    await updateBudgetState(item._id, { state: to });

    setColumns((cols) => {
      const next = { ...cols };
      next[from] = moved;
      next[to] = [...cols[to], { ...item, state: to }];
      return next;
    });
  };

  return (
    <Layout>
      <h2 className="text-lg font-semibold mb-6">Listado de trabajos</h2>
      <div className="flex gap-4 p-2 overflow-x-auto h-[70vh]">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATES.map(state => (
            <Droppable key={state} droppableId={state}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-50 rounded-lg p-4 w-72 min-h-[60vh] shadow flex flex-col"
                >
                  <h3 className="font-bold text-base mb-2 text-red-600">{STATE_LABELS[state]}</h3>
                  {columns[state].map((budget, idx) => (
                    <Draggable key={budget._id} draggableId={budget._id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-4 p-4 bg-white rounded shadow border border-gray-200 ${
                            snapshot.isDragging ? "ring-2 ring-red-300" : ""
                          }`}
                        >
                          <div className="font-semibold">
                            Cliente: {budget.bike_id?.client_id?.name || "-"}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            Bici: {budget.bike_id?.brand} {budget.bike_id?.model}
                          </div>
                          <div className="mb-1">
                            <span className="font-bold">Servicios:</span>
                            <ul className="ml-2 list-disc text-xs">
                              {(budget.services || []).map((s, i) => (
                                <li key={i}>
                                  {s.name} (${s.price_usd})
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
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </Layout>
  );
};

export default WorkList;
