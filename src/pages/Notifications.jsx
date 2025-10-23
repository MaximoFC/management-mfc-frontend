import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegCheckCircle, FaTrashAlt } from "react-icons/fa";
import { fetchNotifications, markNotificationAsSeen, deleteNotification } from "../services/notificationService";
import { confirmToast } from "../components/ConfirmToast";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const all = await fetchNotifications();
      setNotifications(all);
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
      await markNotificationAsSeen(id);
      window.dispatchEvent(new Event("notifications-updated"));
      loadNotifications();
    } catch (error) {
      console.error("Error updating notification", error);
    }
  };

  const handleDelete = async (id) => {
    confirmToast(
      "¿Seguro que deseas eliminar esta notificación?",
      async () => {
        try {
          await deleteNotification(id);
          loadNotifications();
          toast.success("Notificación eliminada");
        } catch (error) {
          console.error("Error deleting notification: ", error);
          toast.error("No se pudo eliminar");
        }
      }
    );
  };

  return (
    <Layout>
      <div className="px-4 py-6 flex flex-col gap-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center md:text-left">
          Notificaciones
        </h2>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center md:text-left">
            No hay notificaciones por el momento
          </p>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={i}
              className="border border-gray-300 rounded-md p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {!notif.seen && (
                  <span className="text-red-500 text-md font-semibold flex items-center gap-1">
                    <IoAlertCircleOutline className="h-5 w-5 shrink-0" />
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

              <div className="flex gap-3 items-center self-end md:self-auto">
                {!notif.seen && (
                  <button
                    onClick={() => markAsSeen(notif._id)}
                    className="text-sm text-blue-600 hover:underline cursor-pointer flex gap-2 items-center whitespace-nowrap self-end md:self-auto"
                  >
                    Marcar como leída
                    <FaRegCheckCircle className="w-4 h-4 shrink-0" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(notif._id)}
                  className="text-sm text-red-600 hover:underline cursor-pointer flex gap-2 items-center whitespace-nowrap"
                >
                  Eliminar
                  <FaTrashAlt className="w-4 h-4 shrink-0" />
                </button>
              </div>
              
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
