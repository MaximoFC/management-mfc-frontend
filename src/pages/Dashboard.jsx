import Layout from "../components/Layout";

const Dashboard = () => {
    return (
        <Layout>        
            <div className="flex flex-col bg-gray-100 p-8 gap-6">
                <div className="flex flex-col gap-2 bg-red-100 rounded-xl border-1 border-red-200 p-6">
                    <h2 className="text-xl font-semibold text-red-600">Alertas importantes</h2>
                    <p>Cadenas Shimano - Stock bajo</p>
                    <p>Giant Hybrid pendiente de retiro</p>
                    {/* Sección para colocar notificaciones importantes: stock bajo, trabajos pagados y no retirados */}
                </div>
                <div className="flex gap-4">
                    <div className="rounded-xl border-1 border-gray-300 p-6 w-1/4">
                        <h2 className="text-lg">Caja actual</h2>
                        <p className="text-2xl font-semibold text-green-500">$200.000</p>
                        <p className="text-gray-600">+ $100.000 hoy</p>
                    </div>
                    <div className="rounded-xl border-1 border-gray-300 p-6 w-1/4">
                        <h2 className="text-lg">Trabajos pendientes</h2>
                        <p className="text-2xl font-semibold">5</p>
                    </div>
                    <div className="rounded-xl border-1 border-gray-300 p-6 w-1/4">
                        <h2 className="text-lg">Clientes activos</h2>
                        <p className="text-2xl font-semibold">40</p>
                        <p className="text-gray-600">+12 este mes</p>
                    </div>
                    <div className="rounded-xl border-1 border-gray-300 p-6 w-1/4">
                        <h2 className="text-lg">Stock bajo</h2>
                        <p className="text-2xl font-semibold text-red-600">3</p>
                        <p className="text-gray-600">Repuestos críticos</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-3/4 flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold">Trabajos recientes</h2>
                        <p className="border-1 border-gray-300 p-2 rounded-xl">Juan Pérez - Specialized Road - $70.000 - Pendiente - 02/06/25</p>
                        <p className="border-1 border-gray-300 p-2 rounded-xl">Juan Pérez - Specialized Road - $70.000 - Pendiente - 02/06/25</p>
                        <p className="border-1 border-gray-300 p-2 rounded-xl">Juan Pérez - Specialized Road - $70.000 - Pendiente - 02/06/25</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold">Acciones rápidas</h2>
                            <a href="" className="border-1 border-gray-300 p-2 rounded-xl">Nuevo cliente</a>
                            <a href="" className="border-1 border-gray-300 p-2 rounded-xl">Crear presupuesto</a>
                            <a href="" className="border-1 border-gray-300 p-2 rounded-xl">Ingreso de repuestos</a>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold">Próximas entregas</h2>
                            <p className="border-1 border-gray-300 p-2 rounded-xl">Ana Martínez - Trek Mountain Bike</p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl">Ana Martínez - Trek Mountain Bike</p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl">Ana Martínez - Trek Mountain Bike</p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl">Ana Martínez - Trek Mountain Bike</p>
                            <p className="border-1 border-gray-300 p-2 rounded-xl">Ana Martínez - Trek Mountain Bike</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard;