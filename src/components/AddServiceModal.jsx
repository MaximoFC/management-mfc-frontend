import { useState } from "react";
import { toast } from "react-toastify";
import { createService, updateService } from "../services/serviceService";
import Modal from "../components/Modal";

const inputClasses =
  "h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200";

// Alta de servicio, o edición si recibe `service`
const AddServiceModal = ({ service = null, onClose, onSuccess }) => {
  const isEdit = !!service;
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [priceArs, setPriceArs] = useState(service?.price_ars != null ? String(service.price_ars) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (loading) return;
    if (!(Number(priceArs) > 0)) {
      setError("El precio debe ser mayor a 0");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = { name: name.trim(), description: description.trim(), price_ars: Number(priceArs) };
      const data = isEdit ? await updateService(service._id, payload) : await createService(payload);
      toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar el servicio");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar servicio" : "Agregar servicio"}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmText={isEdit ? "Guardar" : "Agregar"}
      loading={loading}
      disableConfirm={!name.trim() || !description.trim() || !priceArs}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="service-name" className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input id="service-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="service-description" className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
          <input
            id="service-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="service-price" className="mb-1 block text-sm font-medium text-gray-700">Precio (ARS)</label>
          <input
            id="service-price"
            type="number"
            min="0"
            step="1"
            value={priceArs}
            onChange={(e) => setPriceArs(e.target.value)}
            className={inputClasses}
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              El nuevo precio aplica a presupuestos nuevos. Los existentes conservan el precio con el que se crearon.
            </p>
          )}
        </div>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
};

export default AddServiceModal;
