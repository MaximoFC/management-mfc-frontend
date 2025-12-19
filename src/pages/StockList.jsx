import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import SpareForm from "../components/SpareForm";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSearch } from "../context/SearchContext";
import { SPARE_TYPES } from "../constants/spareTypes";
import {
  deleteBikepart,
  createBikepart,
  updateBikepart,
} from "../services/bikepartService";
import { createFlow } from "../services/cashService";
import { toast } from "react-toastify";
import { confirmToast } from "../components/ConfirmToast";

import { useInventoryStore } from "../store/useInventoryStore";

const StockList = () => {
  const {
    bikeparts,
    addPart,
    updatePart,
    removePart,
  } = useInventoryStore();

  const [filter, setFilter] = useState("");
  const [modalData, setModalData] = useState({
    open: false,
    mode: null,
    spare: null,
  });

  const { searchTerm, setSearchTerm, setOnSearch, setSearchPlaceholder } =
    useSearch();

  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Configurar buscador global
  useEffect(() => {
    setSearchPlaceholder("Buscar repuesto por descripción, código o marca");
    setOnSearch(() => (term) => setSearchTerm(term));

    return () => {
      setSearchPlaceholder("Buscar cliente, trabajo o repuesto");
      setOnSearch(null);
      setSearchTerm("");
    };
  }, []);

  // Filtrado local según search y filter
  const filtered = bikeparts.filter((p) => {
    const matchesFilter =
      filter === "" || p.type?.toLowerCase() === filter.toLowerCase();

    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      search === "" ||
      p.description?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.code?.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (mode, spare = null) => {
    setModalData({ open: true, mode, spare });
  };

  const closeModal = () =>
    setModalData({ open: false, mode: null, spare: null });

  const handleDelete = (id) => {
    confirmToast("¿Estás seguro de eliminar este repuesto?", async () => {
      try {
        await deleteBikepart(id);
        removePart(id);
        toast.success("Repuesto eliminado correctamente");
      } catch (error) {
        console.error("Error deleting bikepart", error);
        toast.error("Error eliminando repuesto");
      }
    });
  };

  const handleFormSubmit = async (data) => {
    try {
      if (modalData.mode === "create") {
        const totalCost = Number(data.stock) * Number(data.amount);
        const newPart = await createBikepart(data);

        await createFlow({
          type: "egreso",
          amount: totalCost,
          description: `Compra: ${newPart.description}`,
        });

        addPart(newPart);

        toast.success("Repuesto agregado");

      } else if (modalData.mode === "update") {
        const updated = await updateBikepart(modalData.spare._id, data);
        updatePart(updated);

        toast.info("Repuesto actualizado");

      } else if (modalData.mode === "replenish") {
        const newStock =
          Number(modalData.spare.stock) + Number(data.stock);

        const updated = await updateBikepart(modalData.spare._id, {
          ...modalData.spare,
          stock: newStock,
        });

        updatePart(updated);

        const totalCost = Number(data.stock) * Number(data.amount);

        await createFlow({
          type: "egreso",
          amount: totalCost,
          description: `Reposición: ${modalData.spare.description}`,
        });

        toast.success("Stock repuesto");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al guardar");
    }
  };

  // Stats
  const lowStock = bikeparts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const withoutStock = bikeparts.filter((p) => p.stock === 0).length;
  const totalInventoryAmount = bikeparts.reduce(
    (acc, p) => acc + p.stock * p.price_usd,
    0
  );

  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        {/* --- STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-md py-2 px-4 bg-white">
            <h2>Stock bajo</h2>
            <p className="text-xl font-bold text-orange-500">{lowStock}</p>
            <p className="text-gray-600 text-sm">Requieren reposición</p>
          </div>
          <div className="border border-gray-300 rounded-md py-2 px-4 bg-white">
            <h2>Sin stock</h2>
            <p className="text-xl font-bold text-red-500">{withoutStock}</p>
            <p className="text-gray-600 text-sm">Agotados</p>
          </div>
          <div className="border border-gray-300 rounded-md py-2 px-4 bg-white">
            <h2>Valor total</h2>
            <p className="text-xl font-bold text-green-500">
              ${totalInventoryAmount.toFixed(2)}
            </p>
            <p className="text-gray-600 text-sm">Inventario actual</p>
          </div>
        </div>

        {/* Botón ingreso */}
        <button
          onClick={() => openModal("create")}
          className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md w-full sm:w-auto cursor-pointer"
        >
          + Ingreso
        </button>

        {/* Filtro */}
        <select
          className="border border-gray-300 rounded-md w-full bg-white p-2 cursor-pointer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos</option>
          {SPARE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Tabla (igual) */}
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="min-w-full bg-white">
            <thead className="text-gray-500 border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((r) => {
                let status = "Alto stock";
                let statusColor = "text-green-600";
                if (r.stock === 0) {
                  status = "Sin stock";
                  statusColor = "text-red-600";
                } else if (r.stock <= 5) {
                  status = "Bajo stock";
                  statusColor = "text-orange-500";
                } else if (r.stock <= 10) {
                  status = "Stock medio";
                  statusColor = "text-yellow-600";
                }

                return (
                  <tr key={r._id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{r.code}</td>
                    <td className="px-4 py-2">{r.type}</td>
                    <td className="px-4 py-2">{r.brand}</td>

                    {/* descripción con hover igual que antes */}
                    <td className="px-4 py-2 max-w-[200px] relative group">
                      <div className="truncate group-hover:whitespace-normal group-hover:absolute group-hover:z-10 group-hover:bg-white group-hover:p-2 group-hover:shadow-xl group-hover:rounded-md group-hover:w-[300px] break-words">
                        {r.description}
                      </div>
                    </td>

                    <td className="px-4 py-2">{r.stock}</td>
                    <td className="px-4 py-2">${r.price_usd}</td>
                    <td className={`px-4 py-2 font-semibold ${statusColor}`}>
                      {status}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => openModal("update", r)}>
                          <FaRegEdit className="w-5 h-5" />
                        </button>

                        <button onClick={() => openModal("replenish", r)}>
                          <IoMdAddCircleOutline className="w-5 h-5" />
                        </button>

                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(r._id)}
                        >
                          <AiOutlineDelete className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination igual */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-red-500 text-white rounded-md disabled:opacity-50"
          >
            Anterior
          </button>

          <span>Página {currentPage}</span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev * itemsPerPage < filtered.length ? prev + 1 : prev
              )
            }
            disabled={currentPage * itemsPerPage >= filtered.length}
            className="px-3 py-1 bg-red-500 text-white rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {modalData.open && (
        <Modal
          title={
            modalData.mode === "create"
              ? "Agregar repuesto"
              : modalData.mode === "update"
              ? "Editar repuesto"
              : "Reponer stock"
          }
          onClose={closeModal}
          onConfirm={() => formRef.current?.requestSubmit()}
          confirmText={
            modalData.mode === "create"
              ? "Agregar"
              : modalData.mode === "update"
              ? "Guardar"
              : "Reponer"
          }
        >
          <SpareForm
            initialData={modalData.spare}
            onSubmit={handleFormSubmit}
            mode={modalData.mode}
            formRef={formRef}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default StockList;
