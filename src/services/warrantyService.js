export const getActiveWarranties = async (clientId, bikeId) => {
    const res = await fetch(
        `http://localhost:4000/api/budgets/active-warranties?client_id=${clientId}&bike_id=${bikeId}`
    );
    if (!res.ok) throw new Error("Error al obtener garantías");
    return res.json();
};