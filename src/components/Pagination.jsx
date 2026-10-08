// Paginación compartida. En celular muestra solo flechas y "página de total" para no desbordar.
export default function Pagination({ page, totalPages, totalItems, pageSize, itemLabel = "resultados", onChange, disabled = false }) {
  if (!totalItems) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  const buttonClasses =
    "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4";

  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      <p className="text-sm text-gray-500">
        <span className="hidden sm:inline">Mostrando </span>
        <span className="font-semibold text-gray-800">{first}</span>–<span className="font-semibold text-gray-800">{last}</span>{" "}
        de <span className="font-semibold text-gray-800">{totalItems}</span>
        <span className="hidden sm:inline"> {itemLabel}</span>
      </p>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => onChange(page - 1)}
          disabled={disabled || page <= 1}
          className={buttonClasses}
        >
          <span className="text-lg leading-none">‹</span>
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <span className="text-sm font-medium whitespace-nowrap text-gray-800">
          {page} de {totalPages}
        </span>
        <button
          type="button"
          aria-label="Página siguiente"
          onClick={() => onChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className={buttonClasses}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span className="text-lg leading-none">›</span>
        </button>
      </div>
    </div>
  );
}
