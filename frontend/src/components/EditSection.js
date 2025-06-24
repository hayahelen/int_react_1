// src/components/EditSection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

import ImageUploadSection from './ImageUploadSection';
import ImageFetchingSection from './ImageFetchingSection';


const API_BASE = 'http://localhost:4000/api';

export default function EditSection({ product, onUpdated, onClose }) {
  const [form, setForm] = useState(null);
  // const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // Combined state for all images
  const MAX_IMAGES = 20;
  

    console.log("PPPPPPP", imageFiles);


  // Initialize form from product
  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price ?? '',
      discount_percentage: product.discount_percentage ?? '',
      rating: product.rating ?? '',
      stock: product.stock ?? '',
      minimum_order_quantity: product.minimum_order_quantity ?? '',
      brand: product.brand || '',
      category: product.category || '',
      sku: product.sku || '',
      weight: product.weight ?? '',
      width: product.dimensions?.width ?? '',
      height: product.dimensions?.height ?? '',
      depth: product.dimensions?.depth ?? '',
      availability_status: product.availability_status || '',
      warranty_information: product.warranty_information || '',
      shipping_information: product.shipping_information || '',
      return_policy: product.returnPolicy || '',
   
      // meta
      tags: (product.tags || []).join(', '),
      barcode: product.meta?.barcode || '',
      qr_code: product.meta?.qr_code || '',
      // reviews
      reviews: (product.reviews || []).map(r => ({
        rating: r.rating ?? '',
        comment: r.comment || '',
        reviewer_name: r.reviewerName || '',
        reviewer_email: r.reviewerEmail || '',
        review_date: r.reviewDate || ''
      }))
    });
  // }, [product]);

    setImageFiles(
      product.images.map(img => {
        const url = typeof img === 'string' ? img : img.url;
        return {
          id: typeof img === 'object' ? img.id : null,
          url: url
        };
      })
    );
  }, [product]);


  console.log("product", product)

  useEffect(() => {
    return () => {
      imageFiles.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [imageFiles]);



  if (!form) return null;

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
    setForm(f => ({
      ...f,
      reviews: f.reviews.filter((_, i) => i !== idx)
    }));
  };


    const handleFilesSelected = files => {
    const newImageFiles = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImageFiles(prev => {
      const updated = [...prev, ...newImageFiles].slice(0, MAX_IMAGES);
      if (updated.length < prev.length + files.length) {
        const overflowCount = prev.length + files.length - MAX_IMAGES;
        newImageFiles.slice(-overflowCount).forEach(item => 
          URL.revokeObjectURL(item.previewUrl)
        );
      }
      return updated;
    });
  };

  const handleRemoveImage = img => {
    setImageFiles(prev => {
      const newList = prev.filter(item => {
        if (item.url) return item.url !== img.url;
        if (item.previewUrl) return item.previewUrl !== img.url;
        return true;
      });
      
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
      console.log("imade idddd", img)
      // delete from server if it's an existing image
      if (img.id) {
        axios.delete(`${API_BASE}/products/${product.id}/images/${img.id}`)
          .catch(err => console.error('Delete failed:', err));
      }
      
      return newList;
    });
  };


   
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
        brand: form.brand,
        category: form.category,
        sku: form.sku,
        weight: parseFloat(form.weight),
        dimensions: {
          width: parseFloat(form.width),
          height: parseFloat(form.height),
          depth: parseFloat(form.depth)
        },
        availability_status: form.availability_status,
        warranty_information: form.warranty_information,
        shipping_information: form.shipping_information,
        return_policy: form.return_policy,

        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        meta: {
          created_at: product.meta?.createdAt,
          updated_at: new Date().toISOString(),
          barcode: form.barcode,
          qr_code: form.qr_code
        },
        reviews: form.reviews
          .map(r => ({
            rating: parseFloat(r.rating),
            comment: r.comment,
            reviewer_name: r.reviewer_name,
            reviewer_email: r.reviewer_email,
            review_date: r.review_date || null
          })),

      };

      const { data:updated } = await axios.put(`${API_BASE}/products/${product.id}`, payload);
      onUpdated(updated)


      // Upload new images
      const newFiles = imageFiles
        .filter(item => item.file)
        .map(item => item.file);

      console.log("HERE WE GOOOOOO",imageFiles)
        
      if (newFiles.length) {
        const formData = new FormData();
        newFiles.forEach(file => formData.append('images', file));
        await axios.post(
          `${API_BASE}/products/${product.id}/images`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      console.log("THE UPDATEDDDDD", updated)


      onClose();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update product.');
    }
  };

  return (
    <div className="add-popup" onClick={onClose}>
      <form
        className="add-content"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button className="close-btn" type="button" onClick={onClose}>
          ×
        </button>
        <h2>Edit Product #{product.id}</h2>

        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>
        <label>
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Discount %
          <input
            name="discount_percentage"
            type="number"
            step="0.01"
            value={form.discount_percentage}
            onChange={handleChange}
          />
        </label>
        <label>
          Rating
          <input
            name="rating"
            type="number"
            step="0.01"
            value={form.rating}
            onChange={handleChange}
          />
        </label>
        <label>
          Stock
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
          />
        </label>
        <label>
          Min Order Qty
          <input
            name="minimum_order_quantity"
            type="number"
            value={form.minimum_order_quantity}
            onChange={handleChange}
          />
        </label>
        <label>
          Brand
          <input name="brand" value={form.brand} onChange={handleChange} />
        </label>
        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </label>
        <label>
          SKU
          <input name="sku" value={form.sku} onChange={handleChange} />
        </label>

        {/* Dimensions */}
        <label>
          Width
          <input
            name="width"
            type="number"
            step="0.001"
            value={form.width}
            onChange={handleChange}
          />
        </label>
        <label>
          Height
          <input
            name="height"
            type="number"
            step="0.001"
            value={form.height}
            onChange={handleChange}
          />
        </label>
        <label>
          Depth
          <input
            name="depth"
            type="number"
            step="0.001"
            value={form.depth}
            onChange={handleChange}
          />
        </label>

        {/* Images */}
        <h3>Current & New Images</h3>
        <ImageFetchingSection
          images={imageFiles}
          onRemove={handleRemoveImage}
        />
        
        <ImageUploadSection 
          onFilesSelected={handleFilesSelected} 
          maxFiles={MAX_IMAGES - imageFiles.length}
        />


        {/* Tags & Meta */}
        <label>
          Tags (comma-sep)
          <input name="tags" value={form.tags} onChange={handleChange} />
        </label>
        <label>
          Barcode
          <input name="barcode" value={form.barcode} onChange={handleChange} />
        </label>
        <label>
          QR Code
          <input name="qr_code" value={form.qr_code} onChange={handleChange} />
        </label>

        {/* Reviews */}
        <section style={{ marginTop: 20 }}>
          <h3>Reviews</h3>
          {form.reviews.map((rev, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #ddd',
                padding: 10,
                marginBottom: 10
              }}
            >
              <label>
                Rating
                <input
                  type="number"
                  step="0.1"
                  value={rev.rating}
                  onChange={e =>
                    handleReviewChange(idx, 'rating', e.target.value)
                  }
                />
              </label>
              <label>
                Comment
                <input
                  type="text"
                  value={rev.comment}
                  onChange={e =>
                    handleReviewChange(idx, 'comment', e.target.value)
                  }
                />
              </label>
              <label>
                Name
                <input
                  type="text"
                  value={rev.reviewer_name}
                  onChange={e =>
                    handleReviewChange(idx, 'reviewer_name', e.target.value)
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={rev.reviewer_email}
                  onChange={e =>
                    handleReviewChange(idx, 'reviewer_email', e.target.value)
                  }
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={rev.review_date}
                  onChange={e =>
                    handleReviewChange(idx, 'review_date', e.target.value)
                  }
                />
              </label>
              <button type="button" onClick={() => removeReview(idx)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addReview}>
            + Add Review
          </button>
        </section>

        <button className="submit-btn" style={{ marginTop: 20 }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
