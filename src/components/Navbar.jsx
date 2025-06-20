import { Link } from "react-router-dom";
import Logo from '/Logo MFC.jpg';
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center h-25 p-4 w-full">
            <div className="flex items-center gap-4">
                <img src={Logo} alt="Logo de MFC" className="w-15 h-15 rounded-xl" />
            </div>
            <div className="w-1/2">
                <input
                    type="text"
                    placeholder="Buscar cliente, trabajo o repuesto"
                    className="border-1 border-gray-300 rounded-xl p-2 w-full"
                />
            </div>
            <div className="flex gap-4">
                <button className="flex justify-center cursor-pointer w-10">
                    <IoIosNotificationsOutline className="h-7 w-7" />
                </button>
                <button className="flex justify-center cursor-pointer w-10">
                    <IoPersonOutline className="h-6 w-6" />
                </button>
            </div>
        </nav>
    )
}

export default Navbar;