# 🛍️ Product Detector Application

A modern web application for detecting products in images using YOLO object detection model. Upload images and visualize detected products with bounding boxes overlaid on the image.

## ✨ Features

- **Drag & Drop Upload**: Easy image upload with drag-and-drop support
- **Real-time Detection**: Fast product detection using YOLO model
- **Visual Bounding Boxes**: Color-coded bounding boxes drawn directly on images
- **Detection Details**: View confidence scores and coordinates for each detection
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **REST API**: FastAPI backend with Swagger documentation

## 🏗️ Architecture

```
Detector API/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styles
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Node dependencies
├── best (1).pt             # YOLO model weights
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- pip and npm

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment (recommended):**
   ```bash
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   
   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`
   
   View API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

## 📖 Usage

1. **Upload an Image:**
   - Drag and drop an image onto the upload zone, or
   - Click the upload zone to browse and select an image

2. **Detect Products:**
   - Click the "🔍 Detect Products" button
   - Wait for the model to process the image

3. **View Results:**
   - See bounding boxes drawn on the image
   - View detection details including:
     - Product class name
     - Confidence score (percentage)
     - Bounding box coordinates

## 🔌 API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Product Detector API",
  "status": "online",
  "model_loaded": true
}
```

### `POST /detect`
Detect products in an uploaded image

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "success": true,
  "image_dimensions": {
    "width": 1920,
    "height": 1080
  },
  "detections": [
    {
      "bbox": {
        "x1": 100.5,
        "y1": 200.3,
        "x2": 350.7,
        "y2": 450.8
      },
      "confidence": 0.923,
      "class_id": 0,
      "class_name": "product"
    }
  ],
  "total_detections": 1
}
```

### `POST /detect/visualize`
Detect products and return annotated image as base64

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "success": true,
  "image_dimensions": {...},
  "detections": [...],
  "total_detections": 1,
  "visualized_image": "data:image/jpeg;base64,..."
}
```

## 🎨 Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Ultralytics YOLO**: State-of-the-art object detection
- **PyTorch**: Deep learning framework
- **OpenCV**: Image processing
- **Pillow**: Image manipulation

### Frontend
- **React**: JavaScript library for building user interfaces
- **Axios**: HTTP client for API requests
- **HTML5 Canvas**: For drawing bounding boxes
- **CSS3**: Modern styling with gradients and animations

## 🔧 Configuration

### Backend Configuration

Edit `backend/main.py` to adjust:

- **Model Path**: Change `MODEL_PATH` variable (default: `"../best (1).pt"`)
- **Confidence Threshold**: Adjust in `model()` call (default: 0.25)
- **Server Port**: Change in `uvicorn.run()` (default: 8000)

### Frontend Configuration

Edit `frontend/src/App.js` to adjust:

- **API URL**: Change `API_URL` constant (default: `"http://localhost:8000"`)
- **Bounding Box Colors**: Modify `colors` array
- **Canvas Styling**: Adjust drawing parameters in `useEffect`

## 🐛 Troubleshooting

### Backend Issues

**Model not loading:**
- Ensure `best (1).pt` is in the root directory
- Check the model path in `main.py`
- Verify PyTorch and Ultralytics are installed correctly

**CORS errors:**
- Ensure CORS middleware is configured properly
- Check that frontend URL matches allowed origins

### Frontend Issues

**Cannot connect to API:**
- Verify backend is running on port 8000
- Check API_URL in `App.js`
- Look for CORS errors in browser console

**Bounding boxes not showing:**
- Check browser console for errors
- Ensure detections are being returned from API
- Verify canvas is properly overlaying the image

## 📝 Development

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
uvicorn main:app --reload
```

Frontend with hot-reload:
```bash
cd frontend
npm start
```

### Building for Production

Frontend build:
```bash
cd frontend
npm run build
```

The build folder will contain optimized production files.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- YOLO model by Ultralytics
- React team for the amazing framework
- FastAPI for the excellent web framework


