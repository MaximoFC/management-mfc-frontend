// Fechas siempre en formato y zona horaria de Argentina
const TZ = "America/Argentina/Buenos_Aires";

export const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("es-AR", { timeZone: TZ }) : "-";

// Días enteros desde hoy hasta la fecha (negativo si ya pasó)
export const daysUntil = (value) => Math.ceil((new Date(value) - Date.now()) / 86400000);

// "AAAA-MM-DD" en hora argentina, para inputs type="date" y filtros de la API
export const isoDateAR = (date = new Date()) => date.toLocaleDateString("en-CA", { timeZone: TZ });

export const daysAgoISO = (days) => isoDateAR(new Date(Date.now() - days * 86400000));
