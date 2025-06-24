import React from 'react';
import '../App.css';

export default function ImageFetchingSection({ images = [], onRemove }) {
  return (
    <div className="image-fetching-section">
      {images.length === 0 ? (
        <p>No images selected yet.</p>
      ) : (
        <div className="fetched-previews">
          {images.map((img, i) => (
            <div key={i} className="fetched-box">
              <img src={img.url || img} alt={`img-${i}`} />
              {onRemove && (
                <button
                  type="button"
                  className="remove-thumb-btn"
                  onClick={() => onRemove(img)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    
  );
}
