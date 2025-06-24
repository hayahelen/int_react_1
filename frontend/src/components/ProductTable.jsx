import React from 'react';

const ProductTable = ({ products, onRowClick }) => {

  
  return (
      <table className="product-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Brand</th>
          <th>Category</th>
          <th>Price ($)</th>
          <th>Rating ⭐</th>
        </tr>
      </thead>
      <tbody>
      {/* {filterData.map(client) => (<tr>)} */}
        {products.map((prod) => (
          <tr key={prod.id} onClick={() => onRowClick(prod)}>
            <td>{prod.title}</td>
            <td>{prod.brand}</td>
            <td>{prod.category}</td>
            <td>{prod.price}</td>
            <td>{prod.rating}</td>
          </tr>
        ))}
      </tbody>
    </table>
    
  );
};

export default ProductTable;
