import { useEffect, useRef, useState } from "react";

const EMPTY = { items: [], total: 0, page: 1, pages: 1 };

// Lista paginada que se pide al servidor con debounce cada vez que cambia `key`
// (la key resume los filtros: búsqueda, página, categoría...).
// Las respuestas de pedidos anteriores se descartan.
export function useRemoteList(fetcher, key, delay = 300) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      fetcherRef.current()
        .then((res) => {
          if (!active) return;
          setData(res);
          setError(null);
        })
        .catch(() => {
          if (!active) return;
          setData(EMPTY);
          setError("No se pudo cargar la lista. Revisá la conexión e intentá de nuevo.");
        })
        .finally(() => active && setLoading(false));
    }, delay);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key, delay, reloadCount]);

  return { ...data, loading, error, reload: () => setReloadCount((n) => n + 1) };
}
