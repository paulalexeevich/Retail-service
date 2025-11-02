from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import List, Dict
import os

app = FastAPI(title="Product Detector API")

# CORS middleware - allow all origins for development, restrict in production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model (YOLOv5)
MODEL_PATH = os.getenv("MODEL_PATH", "/app/best (1).pt")
try:
    # Try loading as YOLOv5 model using torch.hub
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, force_reload=False, _verbose=False)
    model.conf = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
    print(f"✓ YOLOv5 model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {
        "message": "Product Detector API",
        "status": "online",
        "model_loaded": model is not None
    }


@api_router.get("/health")
async def health():
    return {
        "status": "healthy" if model is not None else "model not loaded",
        "model_path": MODEL_PATH
    }


@api_router.post("/detect")
async def detect_products(file: UploadFile = File(...)):
    """
    Upload an image and get product detection results with bounding boxes
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Read and validate image
        contents = await file.read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array for YOLO
        img_array = np.array(image)
        
        # Run inference (YOLOv5)
        results = model(img_array)
        
        # Extract detections from YOLOv5 results
        detections = []
        # YOLOv5 returns results.xyxy[0] as tensor with format: x1, y1, x2, y2, conf, class
        predictions = results.xyxy[0].cpu().numpy()
        
        for pred in predictions:
            x1, y1, x2, y2, confidence, class_id = pred
            class_id = int(class_id)
            class_name = results.names[class_id]
            
            detections.append({
                "bbox": {
                    "x1": round(float(x1), 2),
                    "y1": round(float(y1), 2),
                    "x2": round(float(x2), 2),
                    "y2": round(float(y2), 2)
                },
                "confidence": round(float(confidence), 3),
                "class_id": class_id,
                "class_name": class_name
            })
        
        # Get image dimensions
        height, width = img_array.shape[:2]
        
        return JSONResponse({
            "success": True,
            "image_dimensions": {
                "width": width,
                "height": height
            },
            "detections": detections,
            "total_detections": len(detections)
        })
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


@api_router.post("/detect/visualize")
async def detect_and_visualize(file: UploadFile = File(...)):
    """
    Upload an image and get both detection results and a base64 visualization
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Read and validate image
        contents = await file.read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array for YOLO
        img_array = np.array(image)
        
        # Run inference (YOLOv5)
        results = model(img_array)
        
        # Get annotated image (YOLOv5 method)
        annotated_img = results.render()[0]  # This draws boxes on the image
        
        # Convert back to PIL Image (BGR to RGB)
        annotated_pil = Image.fromarray(annotated_img)
        
        # Convert to base64
        buffered = io.BytesIO()
        annotated_pil.save(buffered, format="JPEG", quality=95)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Extract detections from YOLOv5 results
        detections = []
        predictions = results.xyxy[0].cpu().numpy()
        
        for pred in predictions:
            x1, y1, x2, y2, confidence, class_id = pred
            class_id = int(class_id)
            class_name = results.names[class_id]
            
            detections.append({
                "bbox": {
                    "x1": round(float(x1), 2),
                    "y1": round(float(y1), 2),
                    "x2": round(float(x2), 2),
                    "y2": round(float(y2), 2)
                },
                "confidence": round(float(confidence), 3),
                "class_id": class_id,
                "class_name": class_name
            })
        
        # Get image dimensions
        height, width = img_array.shape[:2]
        
        return JSONResponse({
            "success": True,
            "image_dimensions": {
                "width": width,
                "height": height
            },
            "detections": detections,
            "total_detections": len(detections),
            "visualized_image": f"data:image/jpeg;base64,{img_str}"
        })
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


# Include the API router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

