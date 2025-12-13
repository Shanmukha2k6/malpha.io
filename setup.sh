#!/bin/bash

echo "========================================"
echo "   Malpha.io - Complete Setup Script"
echo "========================================"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.9+ from https://www.python.org/downloads/"
    exit 1
fi

echo "[OK] Python is installed"
echo ""

# Setup Backend
echo "========================================"
echo "Setting up Backend..."
echo "========================================"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment"
        exit 1
    fi
    echo "[OK] Virtual environment created"
else
    echo "[OK] Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
echo "This may take a few minutes..."
pip install --upgrade pip
pip install fastapi uvicorn yt-dlp pydantic python-multipart

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    echo "Trying alternative installation..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERROR] Installation failed"
        exit 1
    fi
fi

echo "[OK] Backend dependencies installed"
echo ""

cd ..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating .env file..."
    cp "backend/.env.example" "backend/.env" 2>/dev/null
    echo "[OK] .env file created"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload --port 8000"
echo ""
echo "2. In a NEW terminal, start the frontend:"
echo "   cd frontend"
echo "   python3 -m http.server 8080"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:8080"
echo ""
echo "OR use the quick start scripts:"
echo "   ./backend/start-server.sh"
echo "   ./frontend/start-server.sh"
echo ""
echo "========================================"
echo ""

# Ask if user wants to start servers now
read -p "Do you want to start the backend server now? (y/n): " START
if [ "$START" = "y" ] || [ "$START" = "Y" ]; then
    echo ""
    echo "Starting backend server..."
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd backend
    source venv/bin/activate
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
    echo ""
    echo "Setup complete! Run the start scripts when ready."
fi
