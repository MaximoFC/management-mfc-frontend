import { useEffect, useId } from "react";
import { LoadingDots } from "./ui-primitives";

const Modal = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = true,
  disableConfirm = false,
  loading = false, // muestra los puntitos en el botón y bloquea confirmar/cerrar
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose();
      // Enter solo confirma si el foco no está en un campo o botón:
      // así un Enter en un buscador no guarda el formulario a medio completar
      const tag = e.target?.tagName;
      const inField = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag);
      if (e.key === "Enter" && !inField && onConfirm && !disableConfirm && !loading) onConfirm();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onConfirm, disableConfirm, loading]);

  const confirmDisabled = disableConfirm || loading;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="
          bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl relative flex flex-col
          max-h-[calc(100vh-4rem)]
        "
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Cerrar"
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-2xl leading-none z-10 cursor-pointer disabled:opacity-40"
        >
          &times;
        </button>

        {title && (
          <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
            <h2 id={titleId} className="text-xl font-semibold text-gray-800">
              {title}
            </h2>
          </div>
        )}

        <div
          className="
            px-8 py-6 flex-1 overflow-y-auto
            max-h-[70vh]
            space-y-5
          "
          style={{ overscrollBehavior: "contain" }}
        >
          {children}
        </div>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-2xl">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              aria-busy={loading || undefined}
              className={`${
                confirmDisabled && !loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#D90429]"
              } ${loading ? "cursor-wait" : "cursor-pointer"} text-white px-5 py-2 rounded-xl transition min-w-[110px] inline-flex items-center justify-center`}
            >
              {loading ? <LoadingDots /> : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
