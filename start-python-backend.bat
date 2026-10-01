@echo off
echo Starting Python Backend for Inventory Prediction...
echo.

cd py-backend

echo Checking if virtual environment exists...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Checking for model files...
if not exist "models\model_weights.pth" (
    echo WARNING: Model file not found at models\model_weights.pth
    echo Please copy your trained model to this location.
    echo.
    echo You can run: python setup_model.py
    echo to help set up your model files.
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Python Flask API server...
echo Server will be available at: http://localhost:5001
echo.
python app.py

pause