import React, { useEffect, useState } from 'react';
import './App.css';
import ProductTable from './components/ProductTable';
import SearchBar from './components/SearchBar';
import ProductDetailsPopup from './components/ProductDetailsPopup';

const API_BASE = 'http://localhost:3000/api';

const App = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch list (with search)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = query
          ? `${API_BASE}/products/search?q=${encodeURIComponent(query)}`
          : `${API_BASE}/products`;
        const res = await fetch(endpoint);
        const data = await res.json();
            console.log('Fetching:', endpoint);
            console.log('RESSSS:', data);

        setProducts(data);
      } catch (err) {
        console.error('Error fetching products list:', err);
      }
    };

    fetchProducts();
  }, [query]);
  console.log("qqqqqq",query)

  // Handler to load full details for one product
  const handleRowClick = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`);
      const fullData = await res.json();
      setSelectedProduct(fullData);
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  return (
    <div className="App">
      <h1>🛒 Product Explorer</h1>

      <SearchBar query={query} onSearch={setQuery} />

      <ProductTable
        products={products}
        onRowClick={handleRowClick}
      />

      {selectedProduct && (
        <ProductDetailsPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default App;
