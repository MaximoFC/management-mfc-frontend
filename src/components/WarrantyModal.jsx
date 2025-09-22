import { useState } from "react";

export default function WarrantyModal({ services, onConfirm, onCancel }) {
    const [selected, setSelected] = useState([]);

    const toggleService = (id) => {
        setSelected(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Seleccionar servicios con garantía</h2>
                <ul className="mb-4">
                    {services.map(service => (
                        <li key={service.service_id} className="mb-2">
                            <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selected.includes(service.service_id)}
                                onChange={() => toggleService(service.service_id)}
                            />
                                {service.name}
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(selected)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
