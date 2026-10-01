@echo off
echo Starting Spare Parts Forecast Backend...
echo.

echo Installing requirements...
pip install -r requirements.txt

echo.
echo Starting backend server...
python start_backend.py

pause