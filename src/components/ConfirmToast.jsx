import { useState } from "react";
import { toast } from "react-toastify";
import { LoadingDots } from "./ui-primitives";

// Contenido con estado propio: mientras corre la acción, "Sí" muestra los puntitos y no se puede volver a tocar
const ConfirmContent = ({ message, onConfirm, onCancel, closeToast }) => {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        if (busy) return;
        setBusy(true);
        try {
            if (onConfirm) await onConfirm();
        } finally {
            closeToast();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="font-medium text-gray-800">{message}</p>
            <div className="flex justify-end gap-2 mt-3">
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={busy}
                    className="inline-flex min-w-[48px] items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer disabled:cursor-wait disabled:opacity-80"
                >
                    {busy ? <LoadingDots /> : "Sí"}
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                        if (onCancel) onCancel();
                        closeToast();
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm cursor-pointer disabled:opacity-50"
                >
                    No
                </button>
            </div>
        </div>
    );
};

export const confirmToast = (message, onConfirm, onCancel) => {
    toast(
        ({ closeToast }) => (
            <ConfirmContent message={message} onConfirm={onConfirm} onCancel={onCancel} closeToast={closeToast} />
        ),
        {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            position: "top-center",
            className: "bg-white rounded-xl shadow-lg border border-gray-200",
        }
    );
};
