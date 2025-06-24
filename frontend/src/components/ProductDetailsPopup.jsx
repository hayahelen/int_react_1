import React, { useState } from "react";
import { useProductDetails } from '../services/useProductDetails';

import EditSection from "./EditSection";

const ProductDetailsPopup = ({ productId, onClose, onUpdated, onDeleted }) => {
  const { product, loading, error, deleteProduct } = useProductDetails(productId);
  const [showEdit, setShowEdit] = useState(false);

  if (loading) return <div className="popup-backdrop">Loading…</div>;

  if (error || !product) return null;

  const handleDelete = async () => {
    try {
      if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct();
      onDeleted();
      onClose();
    }} catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");

    }
  }
    




  const renderArray = (arr) => (arr ? arr.join(", ") : "N/A");
  const renderObject = (obj) =>
    obj
      ? Object.entries(obj).map(([key, val]) => (
          <li key={key}>
            <strong>{key}:</strong> {String(val)}
          </li>
        ))
      : null;

  console.log('Images array:', product.images);
  console.log('Thumbnail URL:', product.thumbnail);

  
    

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>{product.title}</h2>
        <img src={product.thumbnail} alt={product.title} />
        

        <section>
          <h3>Description</h3>
          <p>{product.description || "N/A"}</p>
        </section>

        <section>
          <h3>Basic Information</h3>
          <ul>
            <li><strong>Brand:</strong> {product.brand || "N/A"}</li>
            <li><strong>Category:</strong> {product.category || "N/A"}</li>
            <li><strong>Price:</strong> ${product.price ?? "N/A"}</li>
            <li><strong>Discount Percentage:</strong> {product.discountPercentage ?? "N/A"}%</li>
            <li><strong>Rating:</strong> {product.rating ?? "N/A"}</li>
            <li><strong>Stock:</strong> {product.stock ?? "N/A"}</li>
            {product.sku && <li><strong>SKU:</strong> {product.sku}</li>}
          </ul>
        </section>

        {product.tags?.length > 0 && (
          <section>
            <h3>Tags</h3>
            <p>{renderArray(product.tags)}</p>
          </section>
        )}

        {product.images?.length > 0 && (
          <section>
            <h3>Images</h3>
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {product.images.map((url, id) => (
                <img
                  key={id}
                  src={url}
                  alt={`${product.title} ${id + 1}`}
                  style={{ maxHeight: "100px", borderRadius: "6px" }}
                />
              ))}
              
            </div>
            
          </section>
          
        )}

        {product.dimensions && (
          <section>
            <h3>Dimensions</h3>
            <ul>{renderObject(product.dimensions)}</ul>
          </section>
        )}

        {product.weight && (
          <section>
            <h3>Weight</h3>
            <p>{product.weight} kg</p>
          </section>
        )}

        {product.meta && (
          <section>
            <h3>Metadata</h3>
            <ul>{renderObject(product.meta)}</ul>
          </section>
        )}

        {product.availabilityStatus && (
          <section>
            <h3>Availability</h3>
            <p>{product.availabilityStatus}</p>
          </section>
        )}
        {product.warrantyInformation && (
          <section>
            <h3>Warranty Information</h3>
            <p>{product.warrantyInformation}</p>
          </section>
        )}
        {product.shippingInformation && (
          <section>
            <h3>Shipping Information</h3>
            <p>{product.shippingInformation}</p>
          </section>
        )}
        {product.returnPolicy && (
          <section>
            <h3>Return Policy</h3>
            <p>{product.returnPolicy}</p>
          </section>
        )}

        {product.reviews?.length > 0 && (
          <section>
            <h3>Reviews</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Rating</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Comment</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reviewer</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {product.reviews.map((rev, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rev.rating ?? 'N/A'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rev.comment || 'No comment'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rev.reviewer_name || 'Anonymous'}<br />({rev.reviewer_email || 'No email'})</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rev.review_date || 'No date'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section>
          <h3>Other Details</h3>
          <ul>
            {Object.entries(product).map(([key, val]) => {
              const skipKeys = [
                "id",
                "title",
                "description",
                "price",
                "discountPercentage",
                "rating",
                "stock",
                "brand",
                "category",
                "thumbnail",
                "images",
                "reviews",
                "tags",
                "dimensions",
                "weight",
                "meta",
                "availabilityStatus",
                "warrantyInformation",
                "shippingInformation",
                "returnPolicy",
                "sku",
              ];
              if (skipKeys.includes(key)) return null;
              return (
                <li key={key}>
                  <strong>{key}:</strong> {typeof val === "object" ? JSON.stringify(val) : String(val)}
                </li>
              );
            })}
          </ul>
        </section>

        
       
        


        <div className="action-buttons">
          <button className="edit-btn" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="close-btn-secondary" onClick={onClose}>Close</button>
        </div>

        {showEdit && (
          <EditSection
            product={product}
            onClose={() => setShowEdit(false)}
            onUpdated={(updatedProduct) => {
              onUpdated(updatedProduct); 
              setShowEdit(false);         
            }}
          />
        )}


        
      </div>
    </div>
  );
};

export default ProductDetailsPopup;
