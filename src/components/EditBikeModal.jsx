import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { updateBike } from "../services/bikeService";

const inputClasses =
  "h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200";

// Editar marca, modelo, color y número de serie (opcional) de una bici existente
export default function EditBikeModal({ bike, onClose, onSaved }) {
  const [form, setForm] = useState({
    brand: bike.brand || "",
    model: bike.model || "",
    color: bike.color || "",
    serialNumber: bike.serialNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateBike(bike._id, form);
      toast.success("Bicicleta actualizada");
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.error || err.message || "No se pudo guardar la bicicleta");
      setSaving(false);
    }
  };

  const fields = [
    { name: "brand", label: "Marca" },
    { name: "model", label: "Modelo" },
    { name: "color", label: "Color" },
    { name: "serialNumber", label: "Número de serie (opcional)", hint: "Sirve para distinguir bicis iguales del mismo cliente." },
  ];

  return (
    <Modal
      title="Editar bicicleta"
      onClose={onClose}
      onConfirm={handleSave}
      confirmText="Guardar"
      loading={saving}
      disableConfirm={!form.brand.trim() || !form.model.trim()}
    >
      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={`bike-${f.name}`} className="mb-1 block text-sm font-medium text-gray-700">
              {f.label}
            </label>
            <input id={`bike-${f.name}`} name={f.name} value={form[f.name]} onChange={handleChange} className={inputClasses} />
            {f.hint && <p className="mt-1 text-xs text-gray-500">{f.hint}</p>}
          </div>
        ))}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
