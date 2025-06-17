import React, { useEffect, useState } from 'react';
import './App.css';
import ProductTable from './components/ProductTable';
import SearchBar from './components/SearchBar';
import ProductDetailsPopup from './components/ProductDetailsPopup';

const App = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const url = query
        ? `https://dummyjson.com/products/search?q=${query}`
        : 'https://dummyjson.com/products';
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products);
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="App">
      <h1>🛒 Product Explorer</h1>
      <SearchBar query={query} onSearch={setQuery} />
      <ProductTable products={products} onRowClick={setSelectedProduct} />
      {selectedProduct && (
        <ProductDetailsPopup product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default App;
