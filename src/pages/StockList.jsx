import { useState, useEffect, useRef, useMemo } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import SpareForm from "../components/SpareForm";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
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
import Pagination from "../components/Pagination";

const StockList = () => {
  const {
    bikeparts,
    addPart,
    updatePart,
    removePart,
    refreshBikeparts,
    fetchBootstrap
  } = useInventoryStore();

  // Primera vez: carga todo. Si ya estaba cargado, refresca los repuestos (el stock pudo cambiar por presupuestos)
  useEffect(() => {
    fetchBootstrap();
    refreshBikeparts();
  }, [fetchBootstrap, refreshBikeparts]);

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

  const [searchTerm, setSearchTerm] = useState("");

  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const importRef = useRef();


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

  const [formSaving, setFormSaving] = useState(false);

  const handleFormSubmit = async (data) => {
    if (formSaving) return;
    setFormSaving(true);
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
      toast.error(err?.error || err?.message || "Ocurrió un error al guardar");
    } finally {
      setFormSaving(false);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
            <p className="mt-1 text-gray-500">
              Gestiona el stock de repuestos y accesorios
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-3">
            <button
              onClick={() => setImportModalOpen(true)}
              className="h-11 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-gray-700 cursor-pointer"
            >
              <FiUpload className="w-4 h-4" />
              Importar Excel
            </button>

            <button
              onClick={() => openModal("create")}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#D90429] text-white flex items-center justify-center gap-2 font-medium cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo repuesto
            </button>
          </div>
        </div>

        {/* --- STATS --- (en celular, tres tarjetas compactas en una fila) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[
            { title: "Stock bajo", value: lowStock, subtitle: "Requieren reposición", color: "text-orange-500", bg: "bg-orange-100", icon: <HiOutlineExclamationTriangle className="w-6 h-6" /> },
            { title: "Sin stock", value: withoutStock, subtitle: "Agotados", color: "text-red-600", bg: "bg-red-100", icon: <BsBoxSeam className="w-5 h-5" /> },
            { title: "Valor total", value: `$${totalInventoryARS.toLocaleString("es-AR")}`, subtitle: "Inventario actual", color: "text-green-600", bg: "bg-green-100", icon: <MdAttachMoney className="w-6 h-6" /> },
          ].map((stat) => (
            <div key={stat.title} className="min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">{stat.title}</p>
                <p className={`mt-1 sm:mt-2 text-base sm:text-2xl font-bold break-words ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 hidden sm:block text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className={`hidden lg:flex w-14 h-14 shrink-0 rounded-2xl items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por código, marca o descripción..."
              aria-label="Buscar repuesto"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            aria-label="Filtrar por tipo"
            className="h-12 w-full lg:w-auto lg:min-w-[200px] rounded-xl border border-gray-300 bg-white px-4 text-gray-700 outline-none cursor-pointer"
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

        {/* Listado: tabla en escritorio, tarjetas en celular */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:block w-full">
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

          <ul className="md:hidden divide-y divide-gray-100">
            {paginated.map((r) => {
              const status = getStatusConfig(r.stock);
              return (
                <li key={r._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 break-words">{r.description}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {r.code} · {r.brand}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-gray-900">{formatPrice(getPrice(r), getCurrency(r))}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {r.type && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {r.type}
                      </span>
                    )}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                      {status.label} · {r.stock} u.
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openModal("update", r)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaRegEdit className="w-4 h-4" /> Editar
                    </button>
                    <button
                      onClick={() => openModal("stock", r)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <IoMdAddCircleOutline className="w-4 h-4" /> Reponer
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <AiOutlineDelete className="w-4 h-4" /> Borrar
                    </button>
                  </div>
                </li>
              );
            })}
            {paginated.length === 0 && (
              <li className="px-6 py-12 text-center text-gray-500">No se encontraron repuestos para los filtros actuales.</li>
            )}
          </ul>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            itemLabel="repuestos"
            onChange={setCurrentPage}
          />
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
          loading={formSaving}
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
          confirmText="Importar"
          loading={importLoading}
        >
          <ImportPricesModal ref={importRef} />
        </Modal>
      )}
    </Layout>
  );
};

export default StockList;