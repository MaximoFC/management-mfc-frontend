const BudgetModal = ({ 
  closeModal,
  selectedServices,
  selectedBikeparts,
  bikeparts,
  dollarRate,
  coveredServices,
  onConfirm
}) => {
  const formatARS = (value) =>
    `$${value.toLocaleString("es-AR")}`;

  const servicesTotalARS = selectedServices.reduce((acc, s) => {
    if (coveredServices.includes(s._id)) return acc;
    return acc + (Number(s.price_usd || 0) * dollarRate);
  }, 0);

  const partsTotalARS = selectedBikeparts.reduce((acc, bp) => {
    const part = bikeparts.find(p => p._id === bp.bikepart_id);
    if (!part) return acc;

    if (part.currency === "USD") {
      return acc + (Number(part.price_usd || 0) * dollarRate * bp.amount);
    }

    return acc + (Number(part.price || 0) * bp.amount);
  }, 0);

  const totalARS = servicesTotalARS + partsTotalARS;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl shadow-xl w-[600px] p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Confirmar Presupuesto</h2>

        {/* Servicios */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Servicios</h3>

          {selectedServices.length === 0 && (
            <p className="text-gray-500">No hay servicios seleccionados</p>
          )}

          {selectedServices.map(s => {
            const covered = coveredServices.includes(s._id);
            const priceARS = covered
              ? 0
              : Number(s.price_usd || 0) * dollarRate;

            return (
              <div key={s._id} className="flex justify-between mb-1">
                <span>
                  {s.name}{" "}
                  {covered && (
                    <span className="text-green-600">
                      (En garantía)
                    </span>
                  )}
                </span>
                <span>{formatARS(priceARS)}</span>
              </div>
            )
          })}
        </div>

        {/* Repuestos */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Repuestos</h3>

          {selectedBikeparts.length === 0 && (
            <p className="text-gray-500">No hay repuestos seleccionados</p>
          )}

          {selectedBikeparts.map(bp => {
            const part = bikeparts.find(p => p._id === bp.bikepart_id);
            if (!part) return null;

            const priceARS =
              part.currency === "USD"
                ? Number(part.price_usd || 0) * dollarRate * bp.amount
                : Number(part.price || 0) * bp.amount;

            return (
              <div key={bp.bikepart_id} className="flex justify-between mb-1">
                <span>
                  {part.description} x{bp.amount}
                </span>
                <span>{formatARS(priceARS)}</span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="font-semibold text-right mt-4 text-lg border-t pt-3">
          Total: {formatARS(totalARS)}
        </div>

        <div className="text-right text-sm text-gray-500 mt-1">
          USD convertidos a ${dollarRate}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={closeModal}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;