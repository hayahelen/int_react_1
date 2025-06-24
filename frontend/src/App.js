import React, { useEffect, useState } from 'react';
import './App.css';
import ProductTable from './components/ProductTable';
import SearchBar from './components/SearchBar';
import ProductDetailsPopup from './components/ProductDetailsPopup';
import AddSection from './components/AddSection';
import { useProducts } from './services/useProducts';


const App = () => {
  const [query, setQuery] = useState('');
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setId]  = useState(null);

  const [showAdd, setShowAdd] = useState(false);

  const { products, loading, error, refetch } = useProducts(query);



  //CREATE

  const handleCreated = async (newProduct) => {
      setShowAdd(false);
      setId(null);
      await refetch();

    }

    //DELETE

  const handleDeleted = async (deletedId) => {
      setId(null)
      await refetch();

    };

    //UPDATE

  const handleUpdated = async (updatedProduct) => {
    setId(null);
    await refetch()
  }

    
    

  return (
    <div className="App">
      <h1>Product Explorer</h1>

      <SearchBar query={query} onSearch={setQuery} />
       <button onClick={() => setShowAdd(true)}>+ Add Product</button>
          {showAdd && <AddSection
          onCreated={handleCreated}
          onClose={() => setShowAdd(false)}
        />}

      {loading && "Loading products..."}
      {error && <p>Error loading products</p>}

      <ProductTable
        products={products}
        onRowClick={(prod) => setId(prod.id)}
      />

      {selectedProductId && (
        <ProductDetailsPopup
          productId={selectedProductId}
          onClose={() => setId(null)}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
          

        />
      )}
    </div>
  );
};

export default App;



//make sure all the api's work (DONE)
//REFACTOR CODE => FETCHPRODUCTS FUNCTION (DONE)
//REFETCH ALL THE PRODUCTS AGAIN (ONHANDLECREATED ON HANDLEDELETED) (DONE)
//IMAGE UPLOAD : MULTIPART FORM DATA
//CREATE/UPDATE TO WORK ON INNERTABLES (done)
//create frontend for the edit








//multer further research
//section above edit and add images to render them
//bug fixes



