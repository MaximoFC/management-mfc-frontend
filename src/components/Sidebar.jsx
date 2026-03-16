import { Link, useLocation } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { GoPeople, GoTools } from "react-icons/go";
import { BsBox2 } from "react-icons/bs";
import { MdOutlineAttachMoney } from "react-icons/md";
import { TfiClipboard } from "react-icons/tfi";
import { BsClipboardCheck } from "react-icons/bs";
import Logo from "/Logo MFC.jpg";

const Sidebar = () => {
  const { pathname } = useLocation();

  const linkClasses = (path) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl transition
    ${
      pathname === path
        ? "bg-red-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <>
      <div className="flex flex-col h-full p-4 gap-2">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <img src={Logo} className="w-10 h-10" />
          <div>
            <p className="font-bold">MFC</p>
            <p className="text-xs text-gray-400">Detailing Service</p>
          </div>
        </div>

        {/* Links */}
        <Link to="/dashboard" className={linkClasses("/dashboard")}>
          <LuLayoutDashboard className="w-6 h-6" /> Dashboard
        </Link>

        <Link to="/clientes" className={linkClasses("/clientes")}>
          <GoPeople className="w-6 h-6" /> Clientes
        </Link>

        <Link to="/trabajos" className={linkClasses("/trabajos")}>
          <GoTools className="w-6 h-6" /> Trabajos
        </Link>

        <Link to="/presupuestos" className={linkClasses("/presupuestos")}>
          <TfiClipboard className="w-5 h-5" /> Presupuestos
        </Link>

        <Link to="/garantias" className={linkClasses("/garantias")}>
          <BsClipboardCheck className="w-6 h-6" /> Garantías
        </Link>

        <Link to="/repuestos" className={linkClasses("/repuestos")}>
          <BsBox2 className="w-5 h-5" /> Inventario
        </Link>

        <Link to="/caja" className={linkClasses("/caja")}>
          <MdOutlineAttachMoney className="w-6 h-6" /> Caja
        </Link>
      </div>
    </>
  );
};

export default Sidebar;