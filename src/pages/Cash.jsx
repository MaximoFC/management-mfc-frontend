import Layout from "../components/Layout";
import { TfiStatsUp, TfiStatsDown } from "react-icons/tfi";
import { IoArrowUpCircleOutline, IoArrowDownCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import axios from "axios";

const Cash = () => {
    const [cash, setCash] = useState('');
    const [flow, setFlow] = useState([]);
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('today');
    const filterLabels = {
        today: 'hoy',
        week: 'esta semana',
        month: 'este mes'
    };

    useEffect(() => {
            axios.get('http://localhost:4000/api/cash/balance')
                .then(res => setCash(res.data))
                .catch(() => setCash('Error'));
        }, []);

    useEffect(() => {
        axios.get('http://localhost:4000/api/cash/flow')
            .then(res => setFlow(res.data))
            .catch(() => setFlow([]));
    }, []);

    const handleAddManualFlow = async () => {
        try {
            await axios.post('http://localhost:4000/api/cash/flow', {
                type,
                amount: Number(amount),
                description
            });
            setType('');
            setAmount('');
            setDescription('');
            setShowModal(false);

            const resFlow = await axios.get('http://localhost:4000/api/cash/flow');
            setFlow(resFlow.data);
            const resBalance = await axios.get('http://localhost:4000/api/cash/balance');
            setCash(resBalance.data);
        } catch (error) {
            alert('Error registering flow ', error);
        }
    };

    const filterDate = () => {
        const now = new Date();
        return flow.filter((mov) => {
            const movDate = new Date(mov.date);
            if (filter === 'today') {
                return (
                    movDate.toDateString() === now.toDateString()
                );
            } else if (filter === 'week') {
                const pastWeek = new Date(now);
                pastWeek.setDate(now.getDate() - 6);

                pastWeek.setHours(0, 0, 0, 0);
                const endOfToday = new Date(now);
                endOfToday.setHours(23, 59, 59, 999);

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1 );
                yesterday.setHours(23, 59, 59, 999);

                return movDate >= pastWeek && movDate <= yesterday;
            } else if (filter === 'month') {
                return (
                    movDate.getMonth() === now.getMonth() &&
                    movDate.getFullYear() === now.getFullYear()
                );
            } else {
                return true;
            }
        });
    };

    const flowFilter = filterDate();
    const income = flowFilter.filter(f => f.type === 'ingreso');
    const expenses = flowFilter.filter(f => f.type === 'egreso');
    const totalIncome = income.reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = expenses.reduce((sum, f) => sum + f.amount, 0);
    const balance = totalIncome - totalExpenses;


    return (
        <Layout>
            <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col bg-red-500 rounded-md shadow-xl h-40 text-white justify-between py-4 px-10">
                    <h2 className="text-xl">Dinero actual en caja</h2>
                    <p className="text-4xl font-bold">${cash.balance}</p>
                    <div className="flex gap-4">
                        <p className="flex gap-3 items-center"><TfiStatsUp className="w-6 h-6" />+ ${totalIncome} {filterLabels[filter]}</p>
                        <p className="flex gap-3 items-center"><TfiStatsDown className="w-6 h-6" />- ${totalExpenses} {filterLabels[filter]}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex bg-gray-200 rounded-md p-4 justify-between gap-2">
                        <button 
                            onClick={() => setFilter('today')}
                            className={`cursor-pointer rounded-md w-1/3 p-2 border-1 border-gray-500 ${
                                filter === 'today' ? 'bg-white font-semibold' : ''
                            }`}
                        >
                            Hoy
                        </button>
                        <button 
                            onClick={() => setFilter('week')}
                            className={`cursor-pointer rounded-md w-1/3 p-2 border-1 border-gray-500 ${
                                filter === 'week' ? 'bg-white font-semibold' : ''
                            }`}
                        >
                            Esta semana
                        </button>
                        <button 
                            onClick={() => setFilter('month')}
                            className={`cursor-pointer rounded-md w-1/3 p-2 border-1 border-gray-500 ${
                                filter === 'month' ? 'bg-white font-semibold' : ''
                            }`}
                        >
                            Este mes
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/3 p-6 border-1 border-gray-300 bg-white rounded-md">
                            <div className="flex justify-between items-center">
                                <h3>Ingresos {filterLabels[filter]}</h3>
                                <IoArrowUpCircleOutline className="text-green-500 w-6 h-6" />
                            </div>
                            <p className="text-2xl text-green-500 font-bold">${totalIncome}</p>
                            <p className="text-gray-500">{income.length} movimiento/s</p>
                        </div>
                        <div className="w-1/3 p-6 border-1 border-gray-300 bg-white rounded-md">
                            <div className="flex justify-between items-center">
                                <h3>Egresos {filterLabels[filter]}</h3>
                                <IoArrowDownCircleOutline className="text-green-500 w-6 h-6" />
                            </div>
                            <p className="text-2xl text-red-500 font-bold">${totalExpenses}</p>
                            <p className="text-gray-500">{expenses.length} movimiento/s</p>
                        </div>
                        <div className="w-1/3 p-6 border-1 border-gray-300 bg-white rounded-md">
                            <div className="flex justify-between items-center">
                                <h3>Balance {filterLabels[filter]}</h3>
                                <TfiStatsUp className="w-5 h-5" />
                            </div>
                            <p className="text-2xl text-green-500 font-bold">${balance}</p>
                            <p className="text-gray-500">Diferencia ingresos - egresos</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Historial de movimientos</h2>
                        <button 
                            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md cursor-pointer"
                            onClick={() => setShowModal(true)}
                        >
                            + Agregar movimiento manualmente
                        </button>
                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded-xl w-full max-w-md flex flex-col gap-4">
                                    <h2 className="text-xl font-bold">Movimiento manual</h2>
                                    <select
                                        className="border p-2 rounded"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="ingreso">Ingreso</option>
                                        <option value="egreso">Egreso</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Monto"
                                        className="border p-2 rounded"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Descripción"
                                        className="border p-2 rounded"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-4 mt-4">
                                        <button
                                            className="bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300"
                                            onClick={() => setShowModal(false)}
                                        > 
                                            Cancelar
                                        </button>
                                        <button
                                            className="bg-red-500 text-white p-2 rounded hover:bg-red-700 cursor-pointer"
                                            onClick={handleAddManualFlow}
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <table className="bg-white w-full">
                            <thead className="text-gray-500 border-1 border-gray-300">
                                <tr>
                                    <th className="px-4 py-2 text-left">Tipo</th>
                                    <th className="px-4 py-2 text-left">Monto</th>
                                    <th className="px-4 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-left">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flow.map((mov, i) => (
                                    <tr key={i} className="border-t border-gray-200">
                                        <td className="p-3 font-semibold text-sm">
                                            {mov.type === 'ingreso'
                                                ?   <div className="flex items-center gap-2">
                                                        <IoArrowUpCircleOutline className="text-green-500" />
                                                        <span className="text-green-500">Ingreso</span>
                                                    </div>
                                                :   <div className="flex items-center gap-2">
                                                        <IoArrowDownCircleOutline className="text-red-500" />
                                                        <span className="text-red-500">Egreso</span>
                                                    </div>
                                            }        
                                        </td>
                                        <td className="px-4 py-2">${mov.amount}</td>
                                        <td className="px-4 py-2">{mov.description}</td>
                                        <td className="px-4 py-2">{new Date(mov.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Cash;