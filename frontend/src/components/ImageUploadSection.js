// src/components/ImageUploadSection.js
import React, { useState, useEffect } from 'react';
import '../App.css';

export default function ImageUploadSection({ onFilesSelected, maxFiles = 20 }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Generate previews whenever files change
  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const handleChange = e => {
    const chosen = Array.from(e.target.files).slice(0, maxFiles);
    setFiles(chosen);
    onFilesSelected(chosen);
  };

  return (
    <div className="image-upload-section">
      <label>
        Select up to {maxFiles} images:
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
      </label>
      {/* {previews.length > 0 && (
        <div className="previews">
          {previews.map((url, i) => (
            <img key={i} src={url} alt={`preview-${i}`} />
          ))}
        </div>
      )} */}
    </div>
  );
}
