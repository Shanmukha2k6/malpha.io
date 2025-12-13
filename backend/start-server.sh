#!/bin/bash

echo "========================================"
echo "Malpha.io Backend Server"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo ""
echo "========================================"
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "========================================"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
