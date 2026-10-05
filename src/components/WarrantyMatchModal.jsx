import { useState } from "react";
import Modal from "./Modal";
import { formatDate } from "../utils/dates";

export default function WarrantyMatchModal({ warranties, onApply, onCancel }) {
    const [checked, setChecked] = useState([]);

    const toggle = (id) =>
        setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    return (
        <Modal
            title="Servicios con garantía vigente"
            onClose={onCancel}
            onConfirm={() => onApply(checked)}
            confirmText="Aplicar garantía"
            cancelText="No aplicar"
        >
            <p className="text-sm text-gray-500">
                Esta bicicleta tiene garantía vigente para estos servicios. Los que marques se cobran $0.
            </p>
            <ul className="space-y-2">
                {warranties.map((w) => (
                    <li key={w.serviceId}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#D90429]"
                                checked={checked.includes(w.serviceId)}
                                onChange={() => toggle(w.serviceId)}
                            />
                            <span className="flex-1 font-medium text-gray-900">{w.name}</span>
                            <span className="text-xs text-gray-500">Vence {formatDate(w.endDate)}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </Modal>
    );
}
