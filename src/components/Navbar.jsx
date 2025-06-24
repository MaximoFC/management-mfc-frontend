import { Link } from "react-router-dom";
import Logo from '/Logo MFC.jpg';
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from "react";
import { useSearch } from '../context/SearchContext';

const Navbar = () => {
    const { employee, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const avatarRef = useRef(null);
    const { searchTerm, setSearchTerm, onSearch, searchPlaceHolder } = useSearch();

    const initials = employee?.name?.slice(0, 2).toUpperCase() || 'US';

    const handleChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (onSearch) onSearch(term);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current && 
                !menuRef.current.contains(e.target) &&
                avatarRef.current &&
                !avatarRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="flex justify-between items-center h-25 p-4 w-full border-b-1 border-gray-300">
            <div className="flex items-center gap-4">
                <img src={Logo} alt="Logo de MFC" className="w-15 h-15 rounded-xl" />
            </div>
            <div className="w-1/2">
                <input
                    type="text"
                    placeholder={searchPlaceHolder}
                    className="border-1 border-gray-300 rounded-xl p-2 w-full"
                    value={searchTerm}
                    onChange={handleChange}
                />
            </div>
            <div className="flex gap-4 relative">
                <button className="flex justify-center cursor-pointer p-2 w-11">
                    <IoIosNotificationsOutline className="h-7 w-7" />
                </button>
                <button
                    ref={avatarRef}
                    className="flex justify-center cursor-pointer p-2 w-11 border-1 border-gray-500 rounded-full hover:bg-gray-200"
                    onClick={() => setIsMenuOpen(prev => !prev)}
                >
                    {initials}
                </button>
                {isMenuOpen && (
                    <div
                        className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-xl z-50 border-1 border-gray-300 p-2"
                        ref={menuRef}
                    >
                        <div className="p-2 cursor-default">
                            <p>{employee?.name}</p>
                            <p>({employee?.role})</p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-red-500 cursor-pointer w-full text-left hover:bg-gray-200 p-2 rounded-xl"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar;