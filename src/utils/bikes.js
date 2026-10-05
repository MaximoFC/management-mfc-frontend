// Nombre de una bici para mostrar: marca, modelo, color y número de serie si lo tiene.
// Así dos bicis iguales del mismo cliente se distinguen por su número de serie.
export const bikeLabel = (bike) => {
  if (!bike) return "-";
  const name = `${bike.brand || ""} ${bike.model || ""}`.trim() || "Bicicleta";
  const details = [bike.color, bike.serialNumber && `N° ${bike.serialNumber}`].filter(Boolean);
  return details.length ? `${name} (${details.join(" · ")})` : name;
};
