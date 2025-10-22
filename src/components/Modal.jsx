"use client";

import { useEffect } from "react";

const Modal = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = true,
  disableConfirm = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && onConfirm && !disableConfirm) onConfirm();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onConfirm, disableConfirm]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div
        className="
          bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl relative flex flex-col
          max-h-[calc(100vh-4rem)]
        "
      >
        {/* Botón X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-2xl leading-none z-10"
        >
          &times;
        </button>

        {/* Cabecera */}
        {title && (
          <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              {title}
            </h2>
          </div>
        )}

        {/* Contenido: ajusta scroll solo si hace falta */}
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

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-2xl">
          {showCancel && (
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-md transition"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={disableConfirm}
              className={`${
                disableConfirm
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white px-5 py-2 rounded-md transition`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
