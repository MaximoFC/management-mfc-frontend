import { Link } from "react-router-dom";
import Logo from "/Logo MFC.jpg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "../context/SearchContext";
import axios from "axios";
import { HiMenu } from "react-icons/hi";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { employee, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  const bellRef = useRef(null);
  const notificationRef = useRef(null);
  const { searchTerm, setSearchTerm, onSearch, searchPlaceHolder } =
    useSearch();

  const initials = employee?.name?.slice(0, 2).toUpperCase() || "US";

  const handleChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  useEffect(() => {
    const fetchNotifications = () => {
      axios
        .get("http://localhost:4000/api/notifications")
        .then((res) =>
          setNotifications(res.data.filter((n) => !n.seen).slice(0, 3))
        )
        .catch((err) => {
          setNotifications([]);
          console.error("Error getting notifications", err);
        });
    };

    fetchNotifications();

    const listener = () => fetchNotifications();
    window.addEventListener("notifications-updated", listener);

    return () => window.removeEventListener("notifications-updated", listener);
  }, []);

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

      if (
        bellRef.current &&
        !bellRef.current.contains(e.target) &&
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <nav className="flex justify-between items-center h-25 p-4 w-full border-b-1 border-gray-300">
      <div className="flex items-center gap-4">
        <img
          src={Logo}
          alt="Logo de MFC"
          className="w-15 h-15 rounded-xl hidden md:block"
        />

        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="w-full md:w-1/2 mx-4">
        <input
          type="text"
          placeholder={searchPlaceHolder}
          className="border-1 border-gray-300 rounded-xl p-2 w-full"
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
      <div className="flex gap-4 relative">
        <button
          className="relative flex justify-center cursor-pointer p-2 w-11 border-1 border-gray-500 rounded-full hover:bg-gray-200"
          ref={bellRef}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <IoIosNotificationsOutline className="h-7 w-7" />
          {notifications.some((n) => !n.seen) && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          )}
        </button>

        {showNotifications && (
          <div
            className="absolute right-15 top-14 w-80 bg-white border-1 border-gray-300 rounded-md shadow-md z-50 p-4"
            ref={notificationRef}
          >
            <h4 className="text-lg font-semibold mb-2">Notificaciones</h4>
            <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-gray-500">No hay notificaciones nuevas</p>
              )}
              {notifications.map((n, i) => (
                <li key={i} className="border-b border-gray-400 pb-2">
                  <p className="text-sm font-semibold">
                    {n.type === "alert" ? "Alerta" : "Recordatorio"}
                  </p>
                  <p className="text-sm break-words">{n.message_body}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(n.creation_date)}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              to="/notificaciones"
              onClick={() => {
                setTimeout(() => setShowNotifications(false), 100);
              }}
              className="block text-center mt-4 text-sm text-red-600 hover:underline z-60"
            >
              Ver todas
            </Link>
          </div>
        )}

        <button
          ref={avatarRef}
          className="flex justify-center cursor-pointer p-2 w-11 border-1 border-gray-500 rounded-full hover:bg-gray-200"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {initials}
        </button>
        {isMenuOpen && (
          <div
            className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md z-50 border-1 border-gray-300 p-2"
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
  );
};

export default Navbar;
