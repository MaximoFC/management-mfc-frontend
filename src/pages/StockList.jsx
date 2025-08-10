import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSearch } from "../context/SearchContext";
import { SPARE_TYPES } from "../constants/spareTypes";

const StockList = () => {
  const [spare, setSpare] = useState([]);
  const [filter, setFilter] = useState("");
  const { searchTerm, setSearchTerm, setOnSearch, setSearchPlaceholder } =
    useSearch();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/bikeparts")
      .then((res) => setSpare(res.data))
      .catch(() => setSpare([]));
  }, []);

  useEffect(() => {
    setSearchPlaceholder("Buscar repuesto por descripción o código");

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

  const filteredSpares = spare.filter((r) => {
    const matchesType =
      filter === "" || r.type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "¿Estás seguro de que querés eliminar este repuesto?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:4000/api/bikeparts/${id}`);
      setSpare(spare.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting spare: ", error);
      alert("No se pudo eliminar el repuesto");
    }
  };

  const lowStock = spare.filter((r) => r.stock > 0 && r.stock <= 5).length;
  const withoutStock = spare.filter((r) => r.stock === 0).length;
  const totalInventoryAmount = spare.reduce(
    (total, r) => total + r.stock * r.price,
    0
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
          <Link
            to="/repuestos/nuevo"
            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md w-full sm:w-auto text-center"
          >
            + Ingreso
          </Link>
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

        <div className="overflow-x-auto">
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
              {filteredSpares.map((r, i) => {
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
                    <td className="px-4 py-2">${r.price}</td>
                    <td className={`px-4 py-2 font-semibold ${statusColor}`}>
                      {status}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 items-center justify-start sm:justify-center">
                        <Link
                          to={`/repuestos/editar/${r._id}`}
                          className="hover:text-gray-600 cursor-pointer"
                        >
                          <FaRegEdit className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/repuestos/reponer/${r._id}`}
                          className="hover:text-gray-600 cursor-pointer"
                        >
                          <IoMdAddCircleOutline className="w-5 h-5" />
                        </Link>
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
      </div>
    </Layout>
  );
};

export default StockList;
