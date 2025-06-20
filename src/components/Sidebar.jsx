import { Link, useLocation } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { GoPeople, GoTools } from "react-icons/go";
import { GrDocumentText } from "react-icons/gr";
import { BsBox2 } from "react-icons/bs";
import { MdOutlineAttachMoney } from "react-icons/md";

const Sidebar = () => {
    const { pathname } = useLocation();

    const linkClasses = (path) =>
        `flex gap-4 items-center px-2 py-2 rounded-md hover:bg-gray-200 transition ${
            pathname === path ? "bg-gray-200 font-semibold" : ""
        }`;

    return (
        <div className="flex flex-col h-dvh p-4 gap-4 border-r-1 border-gray-300">
            <Link to="/dashboard" className={linkClasses("/dashboard")}>
                <LuLayoutDashboard className="w-6 h-6" /> Dashboard
            </Link>
            <Link to="/clientes" className={linkClasses("/clientes")}>
                <GoPeople className="w-6 h-6" /> Clientes
            </Link>
            <Link to="trabajos" className={linkClasses("/trabajos")}>
                <GoTools className="w-6 h-6" /> Trabajos
            </Link>
            <Link to="presupuestos" className={linkClasses("/presupuestos")}>
                <GrDocumentText className="w-6 h-6" /> Presupuestos
            </Link>
            <Link to="/repuestos" className={linkClasses("/repuestos")}>
                <BsBox2 className="w-6 h-6" /> Inventario
            </Link>
            <Link to="caja" className={linkClasses("/caja")}>
                <MdOutlineAttachMoney className="w-6 h-6" /> Caja
            </Link>
        </div>
    )
}

export default Sidebar;