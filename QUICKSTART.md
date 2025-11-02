# 🚀 Quick Start Guide

## Prerequisites Installed ✅

Your application is ready to run! All dependencies have been installed:

- Backend: Python packages (FastAPI, PyTorch, YOLO, etc.)
- Frontend: Node modules (React, Axios, etc.)
- Model: `best (1).pt` (YOLOv5 - detects 'product' class)

## Start the Application

### Option 1: Using Scripts (Easiest)

**Terminal 1 - Start Backend:**
```bash
./start_backend.sh
```

**Terminal 2 - Start Frontend:**
```bash
./start_frontend.sh
```

### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## How to Use

1. **Open** http://localhost:3000 in your browser
2. **Upload** an image (drag & drop or click)
3. **Click** "🔍 Detect Products" button
4. **View** bounding boxes and detection results!

## Model Information

- **Type**: YOLOv5s
- **Classes**: ['product']
- **Confidence Threshold**: 0.25 (25%)
- **Input**: JPG, PNG, JPEG images

## Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend won't start
```bash
cd frontend
npm install
npm start
```

### Port 8000 already in use
```bash
lsof -ti:8000 | xargs kill -9
```

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

## Testing the API Directly

Using curl:
```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

Upload an image:
```bash
curl -X POST -F "file=@path/to/image.jpg" http://localhost:8000/detect
```

## Next Steps

- Try uploading product images
- Check the API documentation at http://localhost:8000/docs
- Adjust confidence threshold in `backend/main.py` if needed
- Customize UI colors in `frontend/src/App.css`

Enjoy detecting products! 🛍️


