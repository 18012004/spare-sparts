#!/bin/bash

echo "Starting Python Backend for Inventory Prediction..."
echo

cd py-backend

echo "Checking if virtual environment exists..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo
echo "Checking for model files..."
if [ ! -f "models/model_weights.pth" ]; then
    echo "WARNING: Model file not found at models/model_weights.pth"
    echo "Please copy your trained model to this location."
    echo
    echo "You can run: python setup_model.py"
    echo "to help set up your model files."
    echo
    read -p "Press enter to continue anyway or Ctrl+C to exit..."
fi

echo
echo "Starting Python Flask API server..."
echo "Server will be available at: http://localhost:5001"
echo

python app.py