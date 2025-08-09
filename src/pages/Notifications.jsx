import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error loading notifications", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const markAsSeen = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${id}/seen`);
      window.dispatchEvent(new Event("notifications-updated"));
      loadNotifications();
    } catch (error) {
      console.error("Error updating notification", error);
    }
  };

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Notificaciones</h2>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No hay notificaciones por el momento</p>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={i}
              className="border border-gray-300 rounded-md p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {!notif.seen && (
                  <span className="text-red-500 text-md font-semibold flex items-center gap-1">
                    <IoAlertCircleOutline className="h-5 w-5" />
                    Nueva
                  </span>
                )}
                <p className="text-md font-semibold">
                  {notif.type === "alert" ? "Alerta" : "Recordatorio"}
                </p>
                <p className="text-md break-words overflow-hidden">
                  {notif.message_body}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(notif.creation_date)}
                </p>
              </div>

              {!notif.seen && (
                <button
                  onClick={() => markAsSeen(notif._id)}
                  className="text-sm text-blue-600 hover:underline cursor-pointer flex gap-2 items-center whitespace-nowrap"
                >
                  Marcar como leída
                  <FaRegCheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
