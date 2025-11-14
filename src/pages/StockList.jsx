import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import SpareForm from "../components/SpareForm";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSearch } from "../context/SearchContext";
import { SPARE_TYPES } from "../constants/spareTypes";
import { fetchBikeparts, searchBikeParts, deleteBikepart, getBikepartById, createBikepart, updateBikepart } from "../services/bikepartService";
import { createFlow } from "../services/cashService";
import { toast } from "react-toastify";
import { confirmToast } from "../components/ConfirmToast";

const StockList = () => {
  const [spare, setSpare] = useState([]);
  const [filter, setFilter] = useState("");
  const [modalData, setModalData] = useState({ open: false, mode: null, spare: null });
  const { searchTerm, setSearchTerm, setOnSearch, setSearchPlaceholder } = useSearch();
  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBikeparts()
      .then(setSpare)
      .catch(() => setSpare([]));
  }, []);

  useEffect(() => {
    setSearchPlaceholder("Buscar repuesto por descripción, código o marca");

    setOnSearch(() => (term) => {
      setSearchTerm(term);
    });

    return () => {
      setSearchPlaceholder("Buscar cliente, trabajo o repuesto");
      setOnSearch(null);
      setSearchTerm("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      if (!searchTerm) {
        const data = await fetchBikeparts();
        setSpare(data);
        return;
      }

      try {
        const data = await searchBikeParts(searchTerm);
        setSpare(data);
      } catch (err) {
        console.error("Error fetching search results: ", err);
        setSpare([]);
      }
    };

    fetchFiltered();
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const filteredSpares = spare.filter((r) => {
    return filter === "" || r.type?.toLowerCase() === filter.toLowerCase();
  });

  const handleDelete = (id) => {
    confirmToast(
      "¿Estás seguro de eliminar este repuesto?",
      async () => {
        try {
          await deleteBikepart(id);
          setSpare((prev) => prev.filter((item) => item._id !== id));
          toast.success("Repuesto eliminado correctamente");
        } catch (error) {
          console.error("Error deleting spare:", error);
          toast.error("No se pudo eliminar el repuesto");
        }
      }
    );
  };

  const openModal = async (mode, id = null) => {
    if (id) {
      const data = await getBikepartById(id);
      setModalData({ open: true, mode, spare: data });
    } else {
      setModalData({ open: true, mode, spare: null });
    }
  };

  const closeModal = () => setModalData({ open: false, mode: null, spare: null });

  const handleFormSubmit = async (data) => {
    try {
      if (modalData.mode === "create") {
        const totalCost = Number(data.stock) * Number(data.amount);
        const newPart = await createBikepart(data);

        await createFlow({
          type: "egreso",
          amount: totalCost,
          description: `Compra de nuevo repuesto ${newPart.description}`,
        });

        toast.success("Repuesto agregado con éxito");
      }

      if (modalData.mode === "update") {
        await updateBikepart(modalData.spare._id, data);
        toast.info("Repuesto actualizado correctamente");
      }

      if (modalData.mode === "replenish") {
        const updatedStock = Number(modalData.spare.stock) + Number(data.stock);
        const totalCost = Number(data.stock) * Number(data.amount);

        await updateBikepart(modalData.spare._id, {
          ...modalData.spare,
          stock: updatedStock,
        });
        await createFlow({
          type: "egreso",
          amount: totalCost,
          description: `Reposición de stock: ${modalData.spare.description}`,
        });

        toast.success("Stock repuesto correctamente");
      }

      closeModal();
      const updated = await fetchBikeparts();
      setSpare(updated);
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al guardar el repuesto");
    }
  };

  const lowStock = spare.filter((r) => r.stock > 0 && r.stock <= 5).length;
  const withoutStock = spare.filter((r) => r.stock === 0).length;
  const totalInventoryAmount = spare.reduce(
    (total, r) => total + r.stock * r.price_usd,
    0
  );

  const paginatedSpares = filteredSpares.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
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
              ${totalInventoryAmount}
            </p>
            <p className="text-gray-600 text-sm">Inventario actual</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <button
            onClick={() => openModal("create")}
            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md w-full sm:w-auto text-center cursor-pointer"
          >
            + Ingreso
          </button>
        </div>

        <div>
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
        </div>

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
              {paginatedSpares.map((r, i) => {
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
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-4 py-2">{r.code}</td>
                    <td className="px-4 py-2">{r.type}</td>
                    <td className="px-4 py-2">{r.brand}</td>
                    <td className="px-4 py-2 max-w-[200px] relative group">
                      <div className="truncate group-hover:whitespace-normal group-hover:absolute group-hover:z-10 group-hover:bg-white group-hover:p-2 group-hover:shadow-xl group-hover:rounded-md group-hover:max-h-none group-hover:w-[300px] break-words">
                        {r.description}
                      </div>
                    </td>
                    <td className="px-4 py-2">{r.stock}</td>
                    <td className="px-4 py-2">${r.price_usd}</td>
                    <td className={`px-4 py-2 font-semibold ${statusColor}`}>
                      {status}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 items-center justify-start sm:justify-center">
                        <button onClick={() => openModal("update", r._id)} className="cursor-pointer">
                          <FaRegEdit className="w-5 h-5" />
                        </button>
                        <button onClick={() => openModal("replenish", r._id)} className="cursor-pointer">
                          <IoMdAddCircleOutline className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 cursor-pointer"
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 text-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-red-500 disabled:opacity-50 cursor-pointer text-white"
          >
            Anterior
          </button>

          <span className="text-md">Página {currentPage}</span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev * itemsPerPage < filteredSpares.length ? prev + 1 : prev
              )
            }
            disabled={currentPage * itemsPerPage >= filteredSpares.length}
            className="bg-red-500 px-3 py-1 rounded-md disabled:opacity-50 cursor-pointer text-white"
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
            onSubmitFromModal={true}
            formRef={formRef}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default StockList;
