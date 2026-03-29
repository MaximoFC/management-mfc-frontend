import { useState, useEffect, useRef, useMemo } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import SpareForm from "../components/SpareForm";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSearch } from "../context/SearchContext";
import { SPARE_TYPES } from "../constants/spareTypes";
import { FiSearch, FiUpload, FiPlus } from "react-icons/fi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";
import { MdAttachMoney } from "react-icons/md";
import {
  deleteBikepart,
  createBikepart,
  updateBikepart,
  updateBikepartStock,
  importBikePartPricesExcel
} from "../services/bikepartService";
import { toast } from "react-toastify";
import { confirmToast } from "../components/ConfirmToast";
import { useInventoryStore } from "../store/useInventoryStore";
import ImportPricesModal from "../components/ImportPricesModal";

const StockList = () => {
  const {
    bikeparts,
    addPart,
    updatePart,
    removePart,
    refreshBikeparts
  } = useInventoryStore();

  const formatPrice = (price, currency) => {
  if (currency === "ARS") {
    return `$ ${price.toLocaleString("es-AR")}`;
  }
  return `USD ${price.toFixed(2)}`;
};

  const totalInventoryARS = useMemo(() => {
    return bikeparts
      .filter(p => p.currency === "ARS")
      .reduce((acc, p) => acc + p.stock * p.price, 0);
  }, [bikeparts]);

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

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const importRef = useRef();

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
        const newPart = await createBikepart(data);

        addPart(newPart);

        toast.success("Repuesto agregado");

      } else if (modalData.mode === "update") {
        const updated = await updateBikepart(modalData.spare._id, data);
        updatePart(updated);

        toast.info("Repuesto actualizado");

      } else if (modalData.mode === "stock") {
        const updated = await updateBikepartStock(
          modalData.spare._id,
          data
        )

        updatePart(updated);

        toast.success("Stock repuesto");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleImportExcel = async () => {
    const file = importRef.current?.getFile();

    if (!file) {
      toast.error("Seleccioná un archivo Excel");
      return;
    }

    try {
      setImportLoading(true);

      const res = await importBikePartPricesExcel(file);

      toast.success(
        `Actualizados: ${res.result.updated} | Omitidos: ${res.result.skipped}`
      );

      if (res.result.notFound.length) {
        console.warn("No encontrados: ", res.result.notFound);
      }

      await refreshBikeparts();

      setImportModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Error importando Excel");
    } finally {
      setImportLoading(false);
    }
  };

  // Stats
  const lowStock = bikeparts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const withoutStock = bikeparts.filter((p) => p.stock === 0).length;

  const getPrice = (p) => {
    if (p.currency) return p.price;
    if (p.pricing_currency === "ARS") return p.sale_price_ars;
    return p.price_usd;
  };

  const getCurrency = (p) => {
    return p.currency ?? p.pricing_currency ?? "USD";
  };

  const getStatusConfig = (stock) => {
    if (stock === 0) {
      return {
        label: "Sin stock",
        className: "bg-red-100 text-red-600",
      };
    }

    if (stock <= 5) {
      return {
        label: "Bajo stock",
        className: "bg-orange-100 text-orange-600",
      };
    }

    if (stock <= 10) {
      return {
        label: "Stock medio",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Alto stock",
      className: "bg-green-100 text-green-600",
    };
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="mt-1 text-gray-500">
              Gestiona el stock de repuestos y accesorios
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setImportModalOpen(true)}
              className="h-11 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-gray-700 cursor-pointer"
            >
              <FiUpload className="w-4 h-4" />
              Importar Excel
            </button>

            <button
              onClick={() => openModal("create")}
              className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 font-medium cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo repuesto
            </button>
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock bajo</p>
              <p className="mt-2 text-4xl font-bold text-orange-500">{lowStock}</p>
              <p className="mt-1 text-sm text-gray-500">Requieren reposición</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sin stock</p>
              <p className="mt-2 text-4xl font-bold text-red-600">{withoutStock}</p>
              <p className="mt-1 text-sm text-gray-500">Agotados</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center">
              <BsBoxSeam className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor total</p>
              <p className="mt-2 text-4xl font-bold text-green-600">
                ${totalInventoryARS.toLocaleString("es-AR")}
              </p>
              <p className="mt-1 text-sm text-gray-500">Inventario actual</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por código, marca o descripción..."
              className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="h-12 min-w-[200px] rounded-xl border border-gray-300 bg-white px-4 text-gray-700 outline-none cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {SPARE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-white border-b border-gray-200">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-4 w-[12%]">Código</th>
                  <th className="px-4 py-4 w-[14%]">Tipo</th>
                  <th className="px-4 py-4 w-[12%]">Marca</th>
                  <th className="px-4 py-4 w-[26%]">Descripción</th>
                  <th className="px-4 py-4 w-[10%]">Cantidad</th>
                  <th className="px-4 py-4 w-[14%]">Precio</th>
                  <th className="px-4 py-4 w-[12%]">Estado</th>
                  <th className="px-4 py-4 w-[10%] text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((r) => {
                  const status = getStatusConfig(r.stock);
                
                  return (
                    <tr key={r._id} className="border-b border-gray-100 last:border-b-0 text-sm">
                      <td className="px-4 py-4 font-medium text-gray-900 truncate">
                        {r.code}
                      </td>
                  
                      <td className="px-6 py-4">
                        <span className="inline-flex max-w-full items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 truncate">
                          {r.type}
                        </span>
                      </td>
                  
                      <td className="px-4 py-4 font-medium text-gray-900 truncate">
                        {r.brand}
                      </td>
                  
                      <td className="px-4 py-4">
                        <div className="truncate text-gray-600" title={r.description}>
                          {r.description}
                        </div>
                      </td>
                  
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {r.stock}
                      </td>
                  
                      <td className="px-4 py-4 font-medium text-gray-900 truncate">
                        {formatPrice(getPrice(r), getCurrency(r))}
                      </td>
                  
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium truncate ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                  
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3 text-gray-500">
                          <button
                            onClick={() => openModal("update", r)}
                            className="hover:text-gray-800 cursor-pointer"
                            title="Editar repuesto"
                          >
                            <FaRegEdit className="w-4 h-4" />
                          </button>
                  
                          <button
                            onClick={() => openModal("stock", r)}
                            className="hover:text-gray-800 cursor-pointer"
                            title="Reponer stock"
                          >
                            <IoMdAddCircleOutline className="w-5 h-5" />
                          </button>
                  
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="hover:text-red-600 cursor-pointer"
                            title="Eliminar repuesto"
                          >
                            <AiOutlineDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron repuestos para los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 px-6 py-5 border-t border-gray-200 bg-white sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-800">{filtered.length === 0 ? 0 : startItem}</span> a{" "}
            <span className="font-semibold text-gray-800">{endItem}</span> de{" "}
            <span className="font-semibold text-gray-800">{filtered.length}</span> repuestos
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="text-lg leading-none">‹</span>
              Anterior
            </button>

            <span className="text-sm font-medium text-gray-800 min-w-fit">
              {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
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

      {importModalOpen && (
        <Modal
          title="Actualizar precios desde Excel"
          onClose={() => setImportModalOpen(false)}
          onConfirm={handleImportExcel}
          confirmText={importLoading ? "Importando..." : "Importar"}
          disableConfirm={importLoading}
        >
          <ImportPricesModal ref={importRef} />
        </Modal>
      )}
    </Layout>
  );
};

export default StockList;