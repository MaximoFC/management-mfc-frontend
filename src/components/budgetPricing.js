// Precios de presupuestos en ARS, compartidos por BudgetModal y EditBudgetModal.
// Es solo una vista previa: el total real lo calcula el backend al guardar.

// Servicios: el catálogo y los presupuestos nuevos usan price_ars;
// los presupuestos anteriores a la migración guardaban price_usd.
export function getServicePriceARS(service, dollarRate, isCovered = false) {
  if (isCovered) return 0;
  if (service?.price_ars != null) return Number(service.price_ars);
  return Number(service?.price_usd || 0) * Number(dollarRate || 0);
}

// Repuesto del catálogo ({ currency, price }) por cantidad
export function getPartPriceARS(part, amount, dollarRate) {
  if (!part) return 0;
  const subtotal = Number(part.price || 0) * Number(amount || 0);
  return part.currency === "ARS" ? subtotal : subtotal * Number(dollarRate || 0);
}

// services: [{ price }] ya en ARS; parts: [{ price, currency, amount }]
export function calculateEditableTotalARS(services, parts, dollarRate) {
  const servicesArs = services.reduce((acc, s) => acc + Number(s.price || 0), 0);
  const partsArs = parts.reduce((acc, p) => acc + getPartPriceARS(p, p.amount, dollarRate), 0);
  return servicesArs + partsArs;
}

export function formatARS(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString("es-AR")}`;
}

export function formatPartPrice(part) {
  if (!part) return "";
  return part.currency === "ARS"
    ? formatARS(part.price)
    : `USD ${Number(part.price || 0).toLocaleString("es-AR")}`;
}
