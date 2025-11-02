import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Use environment variable or default to /api for production (nginx proxy)
const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8'
  ];

  const handleImageUpload = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setDetections([]);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const detectProducts = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDetections(response.data.detections);
      setImageDimensions(response.data.image_dimensions);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error processing image');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || detections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas size to match displayed image
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = rect.width / imageDimensions.width;
    const scaleY = rect.height / imageDimensions.height;

    // Draw each detection
    detections.forEach((detection, index) => {
      const { bbox, class_name, confidence } = detection;
      const color = colors[index % colors.length];

      // Scale coordinates
      const x1 = bbox.x1 * scaleX;
      const y1 = bbox.y1 * scaleY;
      const x2 = bbox.x2 * scaleX;
      const y2 = bbox.y2 * scaleY;
      const width = x2 - x1;
      const height = y2 - y1;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);

      // Draw label background
      const label = `${class_name} ${(confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px Arial';
      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - 4, textWidth + 10, textHeight + 4);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x1 + 5, y1 - 8);
    });
  }, [detections, imageDimensions]);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🛍️ Product Detector</h1>
          <p>Upload an image to detect products with AI</p>
        </header>

        <div className="content">
          {/* Upload Section */}
          <div className="upload-section">
            <div
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="drop-zone-content">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3>Drop your image here</h3>
                <p>or click to browse</p>
                <span className="file-types">Supports: JPG, PNG, JPEG</span>
              </div>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {selectedImage && (
              <button
                className="detect-button"
                onClick={detectProducts}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Detecting...
                  </>
                ) : (
                  '🔍 Detect Products'
                )}
              </button>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Display Section */}
          {imageUrl && (
            <div className="display-section">
              <div className="image-container">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded"
                  className="uploaded-image"
                  onLoad={() => {
                    // Trigger redraw when image loads
                    if (detections.length > 0) {
                      setDetections([...detections]);
                    }
                  }}
                />
                <canvas ref={canvasRef} className="detection-canvas" />
              </div>

              {/* Detection Results */}
              {detections.length > 0 && (
                <div className="results-section">
                  <h2>Detection Results</h2>
                  <div className="stats">
                    <div className="stat-item">
                      <span className="stat-value">{detections.length}</span>
                      <span className="stat-label">Products Detected</span>
                    </div>
                  </div>

                  <div className="detections-list">
                    {detections.map((detection, index) => (
                      <div
                        key={index}
                        className="detection-item"
                        style={{ borderLeft: `4px solid ${colors[index % colors.length]}` }}
                      >
                        <div className="detection-header">
                          <span className="detection-class">{detection.class_name}</span>
                          <span className="detection-confidence">
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="detection-bbox">
                          <span className="bbox-label">Box:</span>
                          <span className="bbox-coords">
                            [{detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)}] →
                            [{detection.bbox.x2.toFixed(0)}, {detection.bbox.y2.toFixed(0)}]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;


