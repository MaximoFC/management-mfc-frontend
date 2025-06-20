import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const StockList = () => {
    const [spare, setSpare] = useState([]);
    const [filter, setFilter] = useState('');
    const [find, setFind] = useState('');

    // useEffect(() => {
    //     axios.get('http://localhost:4000/api/spare')
    //         .then(res => setSpare(res.data))
    //         .catch(() => setSpare([]));
    // }, []);      ajustar cuando funcione el backend de repuestos

    const filteredSpares = spare.filter((r) => 
        r.tipe.toLowerCase().includes(filter.toLowerCase()) && 
        (
            r.description.toLowerCase().includes(find.toLowerCase()) ||
            r.codigo.toLowerCase().includes(find.toLowerCase())
        )
    );

    return (
        <Layout>
            <div className="p-8 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
                        <h2>Stock bajo</h2>
                        <p className="text-xl font-bold text-orange-500">5</p>
                        <p className="text-gray-600 text-sm">Requieren reposición</p>
                    </div>
                    <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
                        <h2>Sin stock</h2>
                        <p className="text-xl font-bold text-red-500">0</p>
                        <p className="text-gray-600 text-sm">Agotados</p>
                    </div>
                    <div className="border-1 border-gray-300 rounded-md py-2 px-6 bg-white">
                        <h2>Valor total</h2>
                        <p className="text-xl font-bold text-green-500">$400.000</p>
                        <p className="text-gray-600 text-sm">Inventario actual</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-start gap-2">
                    <Link 
                        to="/repuestos/nuevo"
                        className="border-1 border-green-500 p-2 rounded-xl cursor-pointer hover:bg-green-500 hover:text-white"
                    >
                        + Ingreso
                    </Link>
                </div>

                <div className="border-1 boder-black rounded-xl p-4 flex gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por descripción o código"
                        className="p-2 w-1/2 border-1 border-black rounded-xl"
                        value={find}
                        onChange={(e) => setFind(e.target.value)}
                    />
                    <select
                        className="border-1 border-black rounded-xl w-1/2"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="">Piñón</option>
                        <option value="">Plato</option>
                        <option value="">Frenos</option>
                        <option value="">Masas traseras</option>
                        <option value="">Masas delanteras</option>
                    </select>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Tipo</th>
                            <th>Marca</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSpares.map(r => (
                            <tr>
                                <td>{r.code}</td>
                                <td>{r.tipe}</td>
                                <td>{r.brand}</td>
                                <td>{r.description}</td>
                                <td>{r.quantity}</td>
                                <td>{r.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default StockList;