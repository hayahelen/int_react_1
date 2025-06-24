// src/components/AddSection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; 
import ImageUploadSection from './ImageUploadSection';
import ImageFetchingSection from './ImageFetchingSection';

const API_BASE = 'http://localhost:4000/api';

export default function AddSection({ onCreated, onClose }) {
  const [newFiles, setNewFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); 
  const MAX_IMAGES = 20;


  

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discount_percentage: '',
    rating: '',
    stock: '',
    minimum_order_quantity: '',
    brand: '',
    category: '',
    sku: '',
    weight: '',
    availability_status: '',
    warranty_information: '',
    shipping_information: '',
    return_policy: '',
    //for the dimensions
    width: '',
    height: '',
    depth: '',
    //for the images
    image1:'',
    image2:'',
    image3:'',
    thumbnail:'',
    //for meta
    tags: '',
    barcode:'',
    qr_code: '',
    reviews: []

  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleReviewChange = (idx, field, value) => {
    setForm(f => {
      const reviews = [...f.reviews];
      reviews[idx] = { ...reviews[idx], [field]: value };
      return { ...f, reviews };
    });
  };

   const addReview = () => {
    setForm(f => ({
      ...f,
      reviews: [
        ...f.reviews,
        { rating: '', comment: '', reviewer_name: '', reviewer_email: '', review_date: '' }
      ]
    }));
  };

    const removeReview = idx => {
    setForm(f => {
      const reviews = f.reviews.filter((_, i) => i !== idx);
      return { ...f, reviews };
    });
  };

//added
 const handleFilesSelected = chosenFiles => {
    const newImageFiles = chosenFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImageFiles(prev => {
      const updated = [...prev, ...newImageFiles].slice(0, MAX_IMAGES);
      if (updated.length < prev.length + chosenFiles.length) {
        const overflow = prev.length + chosenFiles.length - MAX_IMAGES;
        chosenFiles.slice(-overflow).forEach((_, i) => 
          URL.revokeObjectURL(newImageFiles[newImageFiles.length - 1 - i].previewUrl)
        );
      }
      return updated;
    });
  };

  const handleRemovePreview = imgObj => {
    setImageFiles(prev => {
      const newList = prev.filter(item => item.previewUrl !== imgObj.url);
      URL.revokeObjectURL(imgObj.url); 
      return newList;
    });
  };

  useEffect(() => {
    return () => imageFiles.forEach(item => 
      URL.revokeObjectURL(item.previewUrl)
    );
  }, [imageFiles]);




  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        discount_percentage: parseFloat(form.discount_percentage),
        rating: parseFloat(form.rating),
        stock: parseInt(form.stock, 10),
        minimum_order_quantity: parseInt(form.minimum_order_quantity, 10),
        weight: parseFloat(form.weight),
        brand: form.brand,
        category: form.category,
        sku: form.sku,
        availability_status: form.availability_status,
        warranty_information: form.warranty_information,
        shipping_information: form.shipping_information,
        return_policy: form.return_policy,

        //dimensions

         dimensions: {
          width: parseFloat(form.width),
          height: parseFloat(form.height),
          depth: parseFloat(form.depth)
        },

        // Images
        
        images: [
          { url: form.image1 },
          { url: form.image2 },
          { url: form.image3 },
          { url: form.thumbnail, is_thumbnail: true }
        ].filter(img => img.url !== ''),

        // Tags
        tags: form.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),

        // Meta
        meta: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          barcode: form.barcode,
          qr_code: form.qr_code
        },

        //reviews

         reviews: form.reviews
          .map(r => ({
            rating: parseFloat(r.rating),
            comment: r.comment,
            reviewer_name: r.reviewer_name,
            reviewer_email: r.reviewer_email,
            review_date: r.review_date || null
          }))
          .filter(r => !isNaN(r.rating) || r.comment || r.reviewer_name)
      };
      


      

        
      console.log("RESIST", payload)
      // const { data } = await axios.post(`${API_BASE}/products/`, payload);
      // console.log("SAVEDDDDDDDDDD11111111")
      // onCreated && onCreated(data);


      const { data: created } = await axios.post(
        `${API_BASE}/products`, payload
      );
      console.log("SAVED !", created.id)


  

      if (imageFiles.length) {
              const formData = new FormData();
              imageFiles.forEach(item => 
                formData.append('images', item.file)
              );
              await axios.post(
                `${API_BASE}/products/${created.id}/images`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            }

      onCreated(created);

      console.log("nononono")


      console.log("SAVEDDDDDDDDDD222222")

            

    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create product.');
    }
  };

return (
    <div className="add-popup" onClick={onClose}>
      <form className="add-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button className="close-btn" type="button" onClick={onClose}>×</button>
        <h2>Add New Product</h2>

        <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
        <label>Description<textarea name="description" value={form.description} onChange={handleChange} /></label>
        <label>Price<input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required /></label>
        <label>Discount %<input name="discount_percentage" type="number" step="0.01" value={form.discount_percentage} onChange={handleChange} /></label>
        <label>Rating<input name="rating" type="number" step="0.01" value={form.rating} onChange={handleChange} /></label>
        <label>Stock<input name="stock" type="number" value={form.stock} onChange={handleChange} /></label>
        <label>Min Order Qty<input name="minimum_order_quantity" type="number" value={form.minimum_order_quantity} onChange={handleChange} /></label>
        <label>Brand<input name="brand" value={form.brand} onChange={handleChange} /></label>
        <label>Category<input name="category" value={form.category} onChange={handleChange} /></label>
        <label>SKU<input name="sku" value={form.sku} onChange={handleChange} /></label>
        <label>Weight<input name="weight" type="number" step="0.001" value={form.weight} onChange={handleChange} /></label>

        {/* Dimensions */}
        <label>Width<input name="width" type="number" step="0.001" value={form.width} onChange={handleChange} /></label>
        <label>Height<input name="height" type="number" step="0.001" value={form.height} onChange={handleChange} /></label>
        <label>Depth<input name="depth" type="number" step="0.001" value={form.depth} onChange={handleChange} /></label>

        <label>Availability<input name="availability_status" value={form.availability_status} onChange={handleChange} /></label>
        <label>Warranty<input name="warranty_information" value={form.warranty_information} onChange={handleChange} /></label>
        <label>Shipping<input name="shipping_information" value={form.shipping_information} onChange={handleChange} /></label>
        <label>Return Policy<input name="return_policy" value={form.return_policy} onChange={handleChange} /></label>

   
         <h3>1. Select Images</h3>
        <ImageUploadSection onFilesSelected={handleFilesSelected} />

        <h3>2. Preview Selected</h3>
        <ImageFetchingSection 
        images={imageFiles.map(item => ({ url: item.previewUrl }))} 
        onRemove={handleRemovePreview} 
      />




        {/* Tags */}
        <label>Tags (comma-separated)<input name="tags" value={form.tags} onChange={handleChange} /></label>

        {/* Meta */}
        <label>Barcode<input name="barcode" value={form.barcode} onChange={handleChange} /></label>
        <label>QR Code<input name="qr_code" value={form.qr_code} onChange={handleChange} /></label>


        <section style={{ marginTop: '20px' }}>
          <h3>Reviews</h3>
          {form.reviews.map((rev, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <label>
                Rating
                <input
                  type="number"
                  step="0.1"
                  value={rev.rating}
                  onChange={e => handleReviewChange(idx, 'rating', e.target.value)}
                />
              </label>
              <label>
                Comment
                <input
                  type="text"
                  value={rev.comment}
                  onChange={e => handleReviewChange(idx, 'comment', e.target.value)}
                />
              </label>
              <label>
                Reviewer Name
                <input
                  type="text"
                  value={rev.reviewer_name}
                  onChange={e => handleReviewChange(idx, 'reviewer_name', e.target.value)}
                />
              </label>
              <label>
                Reviewer Email
                <input
                  type="email"
                  value={rev.reviewer_email}
                  onChange={e => handleReviewChange(idx, 'reviewer_email', e.target.value)}
                />
              </label>
              <label>
                Review Date
                <input
                  type="date"
                  value={rev.review_date}
                  onChange={e => handleReviewChange(idx, 'review_date', e.target.value)}
                />
              </label>
              <button type="button" onClick={() => removeReview(idx)} style={{ marginTop: '8px' }}>
                Remove Review
              </button>
            </div>
          ))}
          <button type="button" onClick={addReview}>
            + Add Review
          </button>
        </section>

        <button className="submit-btn" type="submit" style={{ marginTop: '20px' }}>
          Create Product
        </button>
      </form>
    </div>
  );
}
    