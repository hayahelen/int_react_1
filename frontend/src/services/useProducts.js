import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api';

export function useProducts(query) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchData = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const endpoint = query
      ? `${API_BASE}/products/search?q=${encodeURIComponent(query)}`
      : `${API_BASE}/products`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setProducts(Array.isArray(data) ? data : data.products ?? []);
      })
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false));

    return () => { isMounted = false; };
  }, [query]);

  useEffect(fetchData, [fetchData]);

  return { products, loading, error, refetch:fetchData };
}
