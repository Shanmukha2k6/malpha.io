@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Malpha.io - Complete Setup Script
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python is installed
echo.

REM Setup Backend
echo ========================================
echo Setting up Backend...
echo ========================================
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
echo This may take a few minutes...
pip install --upgrade pip
pip install fastapi uvicorn yt-dlp pydantic python-multipart

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo Trying alternative installation...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Installation failed
        pause
        exit /b 1
    )
)

echo [OK] Backend dependencies installed
echo.

cd ..

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating .env file...
    copy "backend\.env.example" "backend\.env" >nul 2>&1
    echo [OK] .env file created
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn main:app --reload --port 8000
echo.
echo 2. In a NEW terminal, start the frontend:
echo    cd frontend
echo    python -m http.server 8080
echo.
echo 3. Open your browser:
echo    http://localhost:8080
echo.
echo OR use the quick start scripts:
echo    backend\start-server.bat
echo    frontend\start-server.bat
echo.
echo ========================================
echo.

REM Ask if user wants to start servers now
set /p START="Do you want to start the backend server now? (y/n): "
if /i "%START%"=="y" (
    echo.
    echo Starting backend server...
    echo Press Ctrl+C to stop the server
    echo.
    cd backend
    call venv\Scripts\activate.bat
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
) else (
    echo.
    echo Setup complete! Run the start scripts when ready.
    pause
)
