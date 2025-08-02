import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addClient } from '../services/clientService';

function NewClient() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await addClient({ name, surname, mobileNum });
      navigate('/clientes');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-red-700">Agregar nuevo cliente</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nombre *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Apellido *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Número de teléfono *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={mobileNum}
            onChange={(e) => setMobileNum(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Agregar cliente'}
        </button>
      </form>
    </div>
  );
}

export default NewClient;
