import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchBudgets, updateBudgetState } from "../services/budgetService";
import WarrantyModal from "../components/WarrantyModal";
import { confirmToast } from "../components/ConfirmToast";
import api from "../services/api";
import EditBudgetModal from "../components/EditBudgetModal";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import { updateBudgetItems } from "../services/budgetService";
import { useInventoryStore } from "../store/useInventoryStore";
import { FiClock, FiPackage, FiDollarSign, FiPrinter, FiFileText } from "react-icons/fi";

const STATES = ["iniciado", "en proceso", "terminado", "pagado", "retirado"];
const STATE_LABELS = {
  iniciado: "Iniciado",
  "en proceso": "En proceso",
  terminado: "Terminado",
  pagado: "Pagado",
  retirado: "Retirado",
};

const STATE_COLORS = {
  iniciado: "bg-blue-50 border-blue-200 text-blue-600",
  "en proceso": "bg-yellow-50 border-yellow-200 text-yellow-600",
  terminado: "bg-green-50 border-green-200 text-green-600",
  pagado: "bg-purple-50 border-purple-200 text-purple-600",
  retirado: "bg-gray-50 border-gray-200 text-gray-600",
};

const WorkList = () => {
  const [editBudget, setEditBudget] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [pendingWarrantyBudget, setPendingWarrantyBudget] = useState(null);
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingPickup: 0,
    toCharge: 0,
  });
  const [columns, setColumns] = useState({
    iniciado: [],
    "en proceso": [],
    terminado: [],
    pagado: [],
    retirado: [],
  });

  const openEditModal = (budget) => {
    setEditBudget(budget);
  };

  const closeEditModal = () => {
    setEditBudget(null);
  };

  const safeId = (id) => {
    if (!id || id === "undefined" || id === undefined) {
      console.error("❌ ERROR: budget id está llegando undefined");
      return null;
    }
    return id;
  };

  const setMultipleBikepartStocks = useInventoryStore(
    (s) => s.setMultipleBikepartStocks
  );

  const handleSaveEdit = async (updatedData) => {
    const id = safeId(editBudget?._id);

    if (!id) {
      toast.error(
        "No se puede actualizar porque el ID del presupuesto es inválido"
      );
      return;
    }

    try {
      const result = await updateBudgetItems(id, updatedData);
      const updatedBudget = result.budget;

      // Actualizar SOLO la UI localmente
      setColumns((prev) => {
        const updated = { ...prev };

        const fromKey = Object.keys(updated).find((k) =>
          updated[k].some((b) => b._id === updatedBudget._id)
        );

        if (!fromKey) return prev;

        updated[fromKey] = updated[fromKey].map((b) => {
          if (b._id !== updatedBudget._id) return b;

          return {
            ...b,
            ...updatedBudget,

            // Reinyectar campos poblados que se pierde
            bike_id: b.bike_id, // siempre conservar

            services: updatedBudget.services.map((s) => {
              const found = b.services.find(
                (x) => String(x.service_id?._id) === String(s.service_id)
              );
              return {
                ...s,
                name: found?.name ?? found?.service_id?.name ?? s.name ?? "",
                description:
                  found?.description ?? found?.service_id?.description ?? "",
              };
            }),

            parts: updatedBudget.parts.map((p) => {
              const found = b.parts.find(
                (x) => String(x.bikepart_id?._id) === String(p.bikepart_id)
              );
              return {
                ...p,
                bikepart_id: {
                  ...p.bikepart_id,
                  description:
                    found?.bikepart_id?.description ?? p.description ?? "",
                },
              };
            }),
          };
        });

        return updated;
      });

      // Actualizar stocks en el store local en base a lo que viene poblado en budget.parts
      if (Array.isArray(updatedBudget.parts)) {
        const stockItems = updatedBudget.parts
          .map((p) => {
            const bp = p.bikepart_id;
            if (!bp) return null;
            return { id: String(bp._id), stock: bp.stock };
          })
          .filter(Boolean);

        if (stockItems.length > 0) {
          setMultipleBikepartStocks(stockItems);
        }
      }

      toast.success("Presupuesto actualizado");
      setEditBudget(null);
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error?.message || "No se pudo actualizar el presupuesto");
    }
  };

  useEffect(() => {
    fetchBudgets().then((budgets) => {
      const grouped = {
        iniciado: [],
        "en proceso": [],
        terminado: [],
        pagado: [],
        retirado: [],
      };
      let todayCount = 0;
      let pendingPickup = 0;
      let toCharge = 0;

      const now = new Date();
      budgets.forEach((budget) => {
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
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const from = source.droppableId;
    const to = destination.droppableId;

    const movedBudget = columns[from].find((b) => b._id === draggableId);

    let warranty = null;
    if (to === "terminado") {
      confirmToast(
        "¿Este presupuesto tendrá garantía?",
        async () => {
          setPendingWarrantyBudget(movedBudget);
          setShowWarrantyModal(true);
        },
        async () => {
          await updateBudgetState(movedBudget._id, { state: to });

          setColumns((prev) => {
            const updated = { ...prev };
            updated[from] = [...updated[from]];
            updated[from].splice(source.index, 1);
            updated[to] = [...updated[to], { ...movedBudget, state: to }];
            return updated;
          });

          setStats((prev) => {
            let newToCharge = prev.toCharge;
            let newPendingPickup = prev.pendingPickup;

            newToCharge += Number(movedBudget.total_ars) || 0;
            newPendingPickup++;

            return {
              ...prev,
              toCharge: newToCharge,
              pendingPickup: newPendingPickup,
            };
          });
        }
      );
      return;
    }

    // Update backend
    await updateBudgetState(movedBudget._id, { state: to, warranty });

    // Actualizar columnas (en un solo set)
    setColumns((prev) => {
      const updated = { ...prev };
      updated[from] = [...updated[from]];
      updated[from].splice(source.index, 1);
      updated[to] = [...updated[to], { ...movedBudget, state: to, warranty }];
      return updated;
    });

    // Actualizar estadísticas
    setStats((prev) => {
      let newToCharge = prev.toCharge;
      let newPendingPickup = prev.pendingPickup;

      if (from === "terminado") {
        newToCharge -= Number(movedBudget.total_ars) || 0;
      }
      if (to === "terminado") {
        newToCharge += Number(movedBudget.total_ars) || 0;
      }

      if (
        (from === "terminado" || from === "pagado") &&
        !(to === "terminado" || to === "pagado")
      ) {
        newPendingPickup--;
      }
      if (
        !(from === "terminado" || from === "pagado") &&
        (to === "terminado" || to === "pagado")
      ) {
        newPendingPickup++;
      }

      return {
        ...prev,
        toCharge: newToCharge,
        pendingPickup: newPendingPickup,
      };
    });
  };

  const handlePrintTicket = async (budget) => {
    try {
      const payload = {
        client: {
          name: `${budget.bike_id?.current_owner_id?.name || ""} ${
            budget.bike_id?.current_owner_id?.surname || ""
          }`,
          mobileNum: budget.bike_id?.current_owner_id?.mobileNum?.trim() || "-",
        },
        services: budget.services || [],
        total_ars: budget.total_ars || 0,
      };

      const response = await api.post("/tickets/generate", payload, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket_${payload.client.name}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating ticket: ", error.message);
    }
  };

  const handlePrintForm = async (budget) => {
    try {
      const payload = {
        workshop: {
          name: "Mecánica Facundo Callejas",
          address: "Paraguay 1674, Yerba Buena",
          mobileNum: "+54 9 381 547-5600",
        },
        client: {
          name: `${budget.bike_id?.current_owner_id?.name || ""} ${
            budget.bike_id?.current_owner_id?.surname || ""
          }`,
          dni: budget.bike_id?.current_owner_id?.dni || "-",
          mobileNum: budget.bike_id?.current_owner_id?.mobileNum?.trim() || "-",
        },
        bike: {
          brand: budget.bike_id?.brand || "-",
          model: budget.bike_id?.model || "-",
          frameNumber: budget.bike_id?.frameNumber || "-",
        },
        date: new Date().toLocaleDateString("es-AR"),
      };

      const response = await api.post("/tickets/form", payload, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `formulario_${payload.client.name}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating form: ", error.message);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Lista de Trabajos
          </h1>

          <p className="text-sm text-gray-500">
            Gestiona el flujo de trabajos del taller arrastrando las tarjetas entre columnas
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Trabajos hoy */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Trabajos hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.todayCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">Ingresados en las últimas 24h</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg h-10 w-10 flex items-center justify-center">
              <FiClock className="text-gray-500" />
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes de retiro</p>
              <p className="text-2xl font-semibold text-red-600">
                {stats.pendingPickup}
              </p>
              <p className="text-xs text-gray-500 mt-1">Contando estadía</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg h-10 w-10 flex items-center justify-center">
              <FiPackage className="text-red-500" />
            </div>
          </div>

          {/* Por cobrar */}
          <div className="bg-green-50 border border-green-200 rounded-xl shadow-sm p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Por cobrar</p>
              <p className="text-2xl font-semibold text-green-600">
                ${stats.toCharge.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-gray-500 mt-1">Trabajos terminados</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg h-10 w-10 flex items-center justify-center">
              <FiDollarSign className="text-green-600" />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 py-4">
          <DragDropContext onDragEnd={onDragEnd}>
            {STATES.filter((s) => s !== "retirado").map((state) => (
              <Droppable key={state} droppableId={state}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl p-4 w-full shadow-sm flex flex-col border ${STATE_COLORS[state]}`}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                      <h3 className="font-semibold text-sm">
                        {STATE_LABELS[state]}
                      </h3>

                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/60">
                        {columns[state].length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                      {columns[state].map((budget, idx) => (

                        <Draggable
                          key={budget._id}
                          draggableId={budget._id}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white rounded-xl shadow-sm border border-gray-200
                                cursor-grab active:cursor-grabbing transition
                                ${snapshot.isDragging ? "ring-2 ring-blue-300" : ""}`}
                            >

                              {/* Header */}
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {budget.bike_id?.current_owner_id?.name || "-"}{" "}
                                    {budget.bike_id?.current_owner_id?.surname || "-"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {budget.bike_id?.brand} {budget.bike_id?.model}
                                  </p>
                                </div>
                                <FiEdit
                                  onClick={() => openEditModal(budget)}
                                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                />
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Servicios:</span>
                                <ul className="list-disc ml-4 text-xs">
                                  {(budget.services || []).map((s, i) => (
                                    <li key={i}>{s.name}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Repuestos */}
                              <div className="text-sm text-gray-600 mb-2">
                                <p className="font-medium">Repuestos:</p>
                                <ul className="list-disc ml-4 text-xs">
                                  {(budget.parts || []).slice(0, 2).map((p, i) => (
                                    <li key={i}>
                                      {p.bikepart_id?.description} (x{p.amount})
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-green-600 font-semibold">
                                    ${budget.total_ars?.toLocaleString("es-AR")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(budget.creation_date).toLocaleDateString("es-AR", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handlePrintTicket(budget)}
                                  className="flex items-center justify-center gap-1 flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 rounded-lg"
                                >
                                  <FiPrinter size={14} />
                                  Ticket
                                </button>

                                <button
                                  onClick={() => handlePrintForm(budget)}
                                  className="flex items-center justify-center gap-1 flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 rounded-lg"
                                >
                                  <FiFileText size={14} />
                                  Formulario
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
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
                  ${
                    snapshot.isDraggingOver
                      ? "bg-gray-300 border-gray-500"
                      : "bg-gray-200 border-gray-400"
                  }`}
                >
                  <span
                    className="text-sm font-semibold text-gray-700"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      whiteSpace: "nowrap",
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

        {showWarrantyModal && pendingWarrantyBudget && (
          <WarrantyModal
            services={pendingWarrantyBudget.services}
            onCancel={() => {
              setShowWarrantyModal(false);
              setPendingWarrantyBudget(null);
            }}
            onConfirm={async (selectedServices) => {
              try {
                await updateBudgetState(pendingWarrantyBudget._id, {
                  state: "terminado",
                  giveWarranty: true,
                  warrantyServices: selectedServices,
                });
                setShowWarrantyModal(false);
                setPendingWarrantyBudget(null);

                setColumns((prev) => {
                  const updated = { ...prev };

                  const fromKey = Object.keys(updated).find((key) =>
                    updated[key].some(
                      (b) => b._id === pendingWarrantyBudget._id
                    )
                  );
                  if (!fromKey) return prev;

                  updated[fromKey] = updated[fromKey].filter(
                    (b) => b._id !== pendingWarrantyBudget._id
                  );

                  updated.terminado = [
                    ...updated.terminado,
                    { ...pendingWarrantyBudget, state: "terminado" },
                  ];
                  return updated;
                });

                setStats((prev) => ({
                  ...prev,
                  toCharge:
                    prev.toCharge +
                    Number(pendingWarrantyBudget.total_ars || 0),
                  pendingPickup: prev.pendingPickup + 1,
                }));
              } catch (error) {
                console.error("Error actualizando garantía: ", error);
              }
            }}
          />
        )}
        {editBudget && (
          <EditBudgetModal
            budget={editBudget}
            onClose={closeEditModal}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </Layout>
  );
};

export default WorkList;