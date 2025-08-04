import { useEffect, useState } from "react";

const initialForm = { brand: "", model: "", color: "" };

export default function ClientBikesModal({ client, closeModal }) {
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Traer bicis del cliente
  useEffect(() => {
    fetch(`http://localhost:4000/api/bikes?client_id=${client._id}`)
      .then(res => res.json())
      .then(setBikes)
      .catch(() => setBikes([]));
  }, [client._id]);

  // Manejar formulario
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("http://localhost:4000/api/bikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, current_owner_id: client._id, active: true })
      });
      if (!res.ok) throw new Error("No se pudo agregar la bicicleta");
      setForm(initialForm);
      setMsg({ type: "success", text: "¡Bicicleta agregada!" });

      // Se refresca la listax
      const data = await res.json();
      setBikes(b => [...b, data]);
    } catch {
      setMsg({ type: "error", text: "Error al agregar la bicicleta." });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full flex p-8 relative">
        {/* Cierro */}
        <button onClick={closeModal} className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-red-600">&times;</button>
        {/* Columna izquierda */}
        <div className="w-1/2 border-r pr-8">
          <h3 className="text-xl font-bold mb-4">Bicicletas</h3>
          {bikes.length === 0 ? (
            <p className="text-gray-500">No hay bicicletas para este cliente.</p>
          ) : (
            <ul className="space-y-2">
              {bikes.map(b => (
                <li key={b._id} className="border-b pb-2">
                  <div className="font-medium">{b.brand} {b.model}</div>
                  <div className="text-gray-500">Color: {b.color}</div>
                  <div className="text-xs text-gray-400">ID: {b._id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Columna derecha */}
        <div className="w-1/2 pl-8">
          <h3 className="text-xl font-bold mb-4">Agregar bicicleta</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="brand"
              placeholder="Marca"
              value={form.brand}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="model"
              placeholder="Modelo"
              value={form.model}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="color"
              placeholder="Color"
              value={form.color}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold w-full"
            >
              {loading ? "Agregando..." : "Agregar bicicleta"}
            </button>
            {msg && (
              <div className={`text-center mt-2 ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
