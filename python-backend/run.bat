@echo off
REM Answer Evaluator - Python Backend Startup Script (Windows)

echo.
echo 🚀 Starting Answer Evaluator Python Backend
echo ===========================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

echo ✅ Python is installed

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo 📚 Installing dependencies...
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️  Creating .env file from template...
    copy .env.example .env
    echo 📝 Edit .env if needed
)

REM Run the app
echo.
echo 🎯 Starting Flask application on http://localhost:5000
echo ===========================================
python app.py

pause
