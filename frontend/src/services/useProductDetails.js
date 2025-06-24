import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export function useProductDetails(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    axios.get(`${API_BASE}/products/${id}`)
      .then(res => { if (isMounted) setProduct(res.data); })
      .catch(err => { if (isMounted) setError(err); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [id]);

  const deleteProduct = async () => {
    await axios.delete(`${API_BASE}/products/${id}`);
  };

  return { product, loading, error, deleteProduct };
}
