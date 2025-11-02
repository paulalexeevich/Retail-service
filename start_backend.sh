#!/bin/bash

cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Start the server
echo "🚀 Starting Product Detector API..."
echo "📍 Server will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
python main.py


