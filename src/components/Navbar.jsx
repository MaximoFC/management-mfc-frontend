import { Link } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "../context/SearchContext";
import { fetchNotifications } from "../services/notificationService";

const Navbar = ({ setSidebarOpen }) => {
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
    const load = async () => {
      try {
        const all = await fetchNotifications();
        setNotifications(all.filter((n) => !n.seen).slice(0, 3));
      } catch (error) {
        setNotifications([]);
        console.error("Error getting notifications: ", error);
      }
    };

    load();

      const listener = () => load();
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
    <nav className="flex items-center justify-between w-full h-20 px-4 md:px-6 gap-4">

      {/* Left */}
      <div className="flex items-center gap-3 flex-1 md:flex-none">
        
        {/* Mobile menu */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setSidebarOpen(true)}
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

        {/* Search */}
        <div className="block md:hidden w-full">
          <input
            type="text"
            placeholder={searchPlaceHolder}
            className="border border-gray-300 rounded-xl px-4 py-2 w-full"
            value={searchTerm}
            onChange={handleChange}
          />
        </div>
      </div>

    {/* Search desktop */}
    <div className="hidden md:block flex-1 max-w-md">
      <input
        type="text"
        placeholder={searchPlaceHolder}
        className="border border-gray-300 rounded-xl px-4 py-2 w-full"
        value={searchTerm}
        onChange={handleChange}
      />
    </div>

    {/* Right */}
    <div className="flex items-center gap-3 relative">

      {/* Notifications */}
      <button
        className="relative flex items-center justify-center cursor-pointer p-1.5 w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-100"
        ref={bellRef}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <IoIosNotificationsOutline className="h-6 w-6" />

        {notifications.some((n) => !n.seen) && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showNotifications && (
        <div
          className="absolute top-14 right-0 w-80 bg-white border border-gray-300 rounded-md shadow-md z-50 p-4"
          ref={notificationRef}
        >
          <h4 className="text-lg font-semibold mb-2">Notificaciones</h4>

          <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">

            {notifications.length === 0 && (
              <p className="text-gray-500 text-sm">
                No hay notificaciones nuevas
              </p>
            )}

            {notifications.map((n, i) => (
              <li key={i} className="border-b border-gray-200 pb-2">

                <p className="text-sm font-semibold">
                  {n.type === "alert" ? "Alerta" : "Recordatorio"}
                </p>

                <p className="text-sm break-words">
                  {n.message_body}
                </p>

                <p className="text-xs text-gray-400">
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
            className="block text-center mt-4 text-sm text-red-600 hover:underline"
          >
            Ver todas
          </Link>
        </div>
      )}

      {/* Avatar */}
      <button
        ref={avatarRef}
        className="flex justify-center items-center cursor-pointer w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-100 text-sm font-semibold"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        {initials}
      </button>

      {/* Dropdown usuario */}
      {isMenuOpen && (
        <div
          className="absolute right-0 top-12 w-48 bg-white rounded-md z-50 border border-gray-300 p-2 shadow"
          ref={menuRef}
        >

          <div className="p-2 cursor-default border-b">
            <p className="text-sm font-semibold">{employee?.name}</p>
            <p className="text-xs text-gray-500">
              {employee?.role}
            </p>
          </div>

          <button
            onClick={logout}
            className="text-red-500 cursor-pointer w-full text-left hover:bg-gray-100 p-2 rounded-md text-sm"
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