"use client";
import { toast } from "react-toastify";

export const confirmToast = (message, onConfirm, onCancel) => {
    toast(
        ({ closeToast }) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-800">{message}</p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={async () => {
                            try {
                                if (onConfirm) await onConfirm();
                            } finally {
                                closeToast();
                            }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Sí
                    </button>
                    <button
                        onClick={() => {
                            if (onCancel) onCancel();
                            closeToast();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                    >
                        No
                    </button>
                </div>
            </div>
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
