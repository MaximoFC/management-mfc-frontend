import Layout from "../components/Layout";
import { LuPlus } from "react-icons/lu";
import { BsBox2 } from "react-icons/bs";
import { TfiClipboard } from "react-icons/tfi";
import { PiPersonSimpleBike } from "react-icons/pi";

const Dashboard = () => {
    return (
        <Layout>        
            <div className="flex flex-col bg-gray-100 p-8 gap-6">
                <div className="flex flex-col gap-2 bg-red-100 rounded-md border-1 border-red-200 p-6">
                    <h2 className="text-xl font-semibold text-red-600">Alertas importantes</h2>
                    <p>Cadenas Shimano - Stock bajo</p>
                    <p>Giant Hybrid pendiente de retiro</p>
                    {/* Sección para colocar notificaciones importantes: stock bajo, trabajos pagados y no retirados */}
                </div>
                <div className="flex gap-4">
                    <div className="rounded-md border-1 border-gray-300 p-6 w-1/4 bg-white">
                        <h2 className="text-lg">Caja actual</h2>
                        <p className="text-2xl font-semibold text-green-500">$200.000</p>
                        <p className="text-gray-600">+ $100.000 hoy</p>
                    </div>
                    <div className="rounded-md border-1 border-gray-300 p-6 w-1/4 bg-white">
                        <h2 className="text-lg">Trabajos pendientes</h2>
                        <p className="text-2xl font-semibold">5</p>
                        <p className="text-gray-600">Trabajos sin empezar</p>
                    </div>
                    <div className="rounded-md border-1 border-gray-300 p-6 w-1/4 bg-white">
                        <h2 className="text-lg">Clientes activos</h2>
                        <p className="text-2xl font-semibold">40</p>
                        <p className="text-gray-600">+12 este mes</p>
                    </div>
                    <div className="rounded-md border-1 border-gray-300 p-6 w-1/4 bg-white">
                        <h2 className="text-lg">Stock bajo</h2>
                        <p className="text-2xl font-semibold text-red-600">3</p>
                        <p className="text-gray-600">Repuestos críticos</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-3/5 flex flex-col gap-2 border-1 border-gray-300 rounded-md bg-white py-4 px-6">
                        <h2 className="text-2xl font-semibold">Trabajos recientes</h2>
                        <div className="border-1 border-gray-300 py-2 px-4 rounded-xl flex items-center gap-2">
                            <div className="rounded-full bg-blue-100 p-2">
                                <PiPersonSimpleBike className="h-7 w-7 text-blue-500" />
                            </div>
                            <div className="flex justify-between w-full items-center">
                                <div>
                                    <p>Juan Perez</p>
                                    <p>Specialized Road - Blanca</p>
                                </div>
                                <div className="text-center">
                                    <p className="p-1 rounded-md bg-blue-200">En proceso</p>
                                    <p>$70.000</p>
                                    <p className="text-gray-600">20/06/25</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-1 border-gray-300 py-2 px-4 rounded-xl flex items-center gap-2">
                            <div className="rounded-full bg-blue-100 p-2">
                                <PiPersonSimpleBike className="h-7 w-7 text-blue-500" />
                            </div>
                            <div className="flex justify-between w-full items-center">
                                <div>
                                    <p>Pablo Gómez</p>
                                    <p>Giant Hybrid - Roja</p>
                                </div>
                                <div className="text-center">
                                    <p className="p-1 rounded-md bg-yellow-200">Terminado</p>
                                    <p>$20.000</p>
                                    <p className="text-gray-600">20/06/25</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-1 border-gray-300 py-2 px-4 rounded-xl flex items-center gap-2">
                            <div className="rounded-full bg-blue-100 p-2">
                                <PiPersonSimpleBike className="h-7 w-7 text-blue-500" />
                            </div>
                            <div className="flex justify-between w-full items-center">
                                <div>
                                    <p>Ana Martínez</p>
                                    <p>Trek Mountain Bike - Celeste</p>
                                </div>
                                <div className="text-center">
                                    <p className="p-1 rounded-md bg-green-200">Pagado</p>
                                    <p>$50.000</p>
                                    <p className="text-gray-600">20/06/25</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-2/5">
                        <div className="flex flex-col gap-2 border-1 border-gray-300 rounded-md bg-white py-4 px-6">
                            <h2 className="text-2xl font-semibold">Acciones rápidas</h2>
                            <a href="" className="border-1 border-gray-300 py-2 px-6 rounded-md flex gap-4 items-center">
                                <LuPlus />
                                Nuevo cliente
                            </a>
                            <a href="" className="border-1 border-gray-300 py-2 px-6 rounded-md flex gap-4 items-center">
                                <TfiClipboard />
                                Crear presupuesto
                            </a>
                            <a href="" className="border-1 border-gray-300 py-2 px-6 rounded-md flex gap-4 items-center">
                                <BsBox2 />
                                Ingreso de repuestos
                            </a>
                        </div>
                        <div className="flex flex-col gap-2 border-1 border-gray-300 rounded-md bg-white py-4 px-6">
                            <h2 className="text-2xl font-semibold">Pendientes de retiro</h2>
                            <p className="border-1 border-gray-300 p-2 rounded-xl flex items-center gap-2">
                                <PiPersonSimpleBike className="h-5 w-5 text-red-500" />
                                Ana Martínez - Trek Mountain Bike
                            </p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl flex items-center gap-2">
                                <PiPersonSimpleBike className="h-5 w-5 text-red-500" />
                                Juan Perez - Giant Hybrid
                            </p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl flex items-center gap-2">
                                <PiPersonSimpleBike className="h-5 w-5 text-red-500" />
                                Pablo Gómez - Specialized Road
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard;