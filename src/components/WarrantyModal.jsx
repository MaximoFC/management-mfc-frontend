import { useState } from "react";
import Modal from "./Modal";

// Al terminar, cobrar o retirar un trabajo: elegir qué servicios llevan garantía
export default function WarrantyModal({ services, targetLabel, onConfirm, onCancel }) {
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);

    const toggleService = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

    const handleConfirm = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await onConfirm(selected);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={`Pasar a "${targetLabel}"`}
            onClose={onCancel}
            onConfirm={handleConfirm}
            confirmText={selected.length ? "Confirmar con garantía" : "Confirmar sin garantía"}
            loading={saving}
        >
            <p className="text-sm text-gray-500">
                Marcá los servicios que tienen garantía. Si no marcás ninguno, el trabajo avanza sin garantía.
            </p>
            <ul className="space-y-2">
                {services.map((service) => (
                    <li key={String(service.service_id)}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#D90429]"
                                checked={selected.includes(service.service_id)}
                                onChange={() => toggleService(service.service_id)}
                            />
                            <span className="font-medium text-gray-900">{service.name}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </Modal>
    );
}
