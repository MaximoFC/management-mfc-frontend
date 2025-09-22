import { useState } from "react";

export default function WarrantyMatchModal({ warranties, onApply, onCancel }) {
    const [checked, setChecked] = useState([]);

    const toggle = id =>
        setChecked(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Servicios en garantía</h2>
                <ul className="mb-4">
                    {warranties.map(w => (
                        <li key={w.serviceId} className="mb-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={checked.includes(w.serviceId)}
                                    onChange={() => toggle(w.serviceId)}
                                />
                                <span>
                                    {w.name} – vence:{" "}
                                    {new Date(w.endDate).toLocaleDateString()}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => onCancel()}
                    >
                        No aplicar
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                        onClick={() => onApply(checked)}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
}
