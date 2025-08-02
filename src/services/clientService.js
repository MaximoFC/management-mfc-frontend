const API_URL = 'http://localhost:4000/api/clients';

export async function fetchClients(query = '') {
  const url = query ? `${API_URL}?q=${encodeURIComponent(query)}` : API_URL;
  const res = await fetch(url);
  return res.json();
}

export async function addClient(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al agregar cliente');
  }
  return res.json();
}
