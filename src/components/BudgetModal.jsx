import { useState } from "react";
import Modal from "./Modal";
import { Badge } from "./ui-primitives";
import { FiTool, FiPackage } from "react-icons/fi";
import { getPartPriceARS, getServicePriceARS, formatARS } from "./budgetPricing";

const BudgetModal = ({
  closeModal,
  selectedServices,
  selectedBikeparts,
  bikeparts,
  dollarRate,
  coveredServices,
  onConfirm,
}) => {
  const [saving, setSaving] = useState(false);

  const servicesTotalARS = selectedServices.reduce(
    (acc, s) => acc + getServicePriceARS(s, dollarRate, coveredServices.includes(s._id)),
    0
  );

  const partsTotalARS = selectedBikeparts.reduce((acc, bp) => {
    const part = bikeparts.find((p) => p._id === bp.bikepart_id);
    return acc + getPartPriceARS(part, bp.amount, dollarRate);
  }, 0);

  const hasUsdParts = selectedBikeparts.some(
    (bp) => bikeparts.find((p) => p._id === bp.bikepart_id)?.currency === "USD"
  );

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Confirmar presupuesto"
      onClose={closeModal}
      onConfirm={handleConfirm}
      confirmText="Confirmar"
      loading={saving}
    >
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <FiTool className="h-4 w-4 text-red-600" />
          Servicios
        </h3>

        {selectedServices.length === 0 && (
          <p className="text-sm text-gray-500">No hay servicios seleccionados</p>
        )}

        {selectedServices.map((s) => {
          const covered = coveredServices.includes(s._id);
          return (
            <div key={s._id} className="flex items-center justify-between text-sm text-gray-700">
              <span className="flex items-center gap-2">
                {s.name}
                {covered && <Badge variant="success">En garantía</Badge>}
              </span>
              <span className="font-medium">{formatARS(getServicePriceARS(s, dollarRate, covered))}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <FiPackage className="h-4 w-4 text-red-600" />
          Repuestos
        </h3>

        {selectedBikeparts.length === 0 && (
          <p className="text-sm text-gray-500">No hay repuestos seleccionados</p>
        )}

        {selectedBikeparts.map((bp) => {
          const part = bikeparts.find((p) => p._id === bp.bikepart_id);
          if (!part) return null;
          return (
            <div key={bp.bikepart_id} className="flex items-center justify-between text-sm text-gray-700">
              <span>
                {part.description} x{bp.amount}
              </span>
              <span className="font-medium">{formatARS(getPartPriceARS(part, bp.amount, dollarRate))}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1 border-t border-gray-100 pt-4">
        <div className="flex items-end justify-between">
          <span className="font-semibold text-gray-900">Total estimado</span>
          <span className="text-2xl font-bold text-gray-900">{formatARS(servicesTotalARS + partsTotalARS)}</span>
        </div>
        {hasUsdParts && (
          <p className="text-right text-xs text-gray-500">Repuestos en USD convertidos a ${dollarRate}</p>
        )}
      </div>
    </Modal>
  );
};

export default BudgetModal;
