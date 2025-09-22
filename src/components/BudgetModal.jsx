const BudgetModal = ({ closeModal, selectedServices, selectedBikeparts, totalUSD, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl shadow-xl w-[600px] p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Confirmar Presupuesto</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Servicios</h3>
          {selectedServices.length === 0 && <p className="text-gray-500">No hay servicios seleccionados</p>}
          {selectedServices.map(s => (
            <div key={s.service_id} className="flex justify-between mb-1">
              <span>
                {s.name} {s.covered && <span className="text-green-600">(En garantía)</span>}
              </span>
              <span>${s.covered ? 0 : s.price}</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Repuestos</h3>
          {selectedBikeparts.length === 0 && <p className="text-gray-500">No hay repuestos seleccionados</p>}
          {selectedBikeparts.map(bp => (
            <div key={bp.bikepart_id} className="flex justify-between mb-1">
              <span>{bp.name} x{bp.amount}</span>
              <span>${bp.price * bp.amount}</span>
            </div>
          ))}
        </div>

        <div className="font-semibold text-right mt-4 text-lg">
          Total: ${totalUSD.toFixed(2)} USD
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
