# Quick Start Guide

## 🚀 Start the Application

### 1. Start Python Backend (with LSTM Model)

```bash
# Navigate to Python backend
cd py-backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Copy your model file to models/model_weights.pth
# Or run: python setup_model.py

# Start the server
python app.py
```

**Expected Output:**
```
✅ Model and scaler loaded successfully
🚀 Starting Flask API server...
* Running on http://0.0.0.0:5001
```

### 2. Start Frontend

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start the React app
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
```

### 3. Test the Integration

1. **Open Browser**: Go to `http://localhost:3000`
2. **Login**: Use any email/password (authentication is simulated for Python backend)
3. **Check Dashboard**: You should see the Backend Switcher showing "Python (LSTM Model)"
4. **Test Predictions**: Go to Forecast page and run a prediction

## 🔧 Troubleshooting

### Frontend Errors

**Error: "Cannot access 'API_CONFIG' before initialization"**
- This should be fixed now. If you still see it, restart the frontend server.

**Error: "Network Error" or "Failed to fetch"**
- Check if Python backend is running on port 5001
- Test: `curl http://localhost:5001/health`

### Python Backend Errors

**Error: "Model file not found"**
```bash
cd py-backend
python setup_model.py
# Follow the prompts to set up your model file
```

**Error: "Module not found"**
```bash
cd py-backend
pip install -r requirements.txt
```

### Quick Health Check

Test both backends:
```bash
# Python backend
curl http://localhost:5001/health

# Expected response:
# {"status":"healthy","model_loaded":true,"scaler_loaded":true,"predictor_ready":true}

# Frontend
curl http://localhost:3000
# Should return the React app HTML
```

## 🎯 Testing Predictions

### Sample API Test (Python Backend)

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "historical_data": [45, 52, 48, 61, 55, 67, 71, 63, 58, 72, 69, 74, 66, 59, 62, 68, 75, 70, 64, 77],
    "prediction_days": 7
  }'
```

### Frontend Test

1. Go to **Forecast** page
2. Select any spare part
3. Set "Months to Forecast" to 3
4. Click "Run Forecast"
5. You should see a chart with predictions from your LSTM model

## 🔄 Switch Between Backends

### Method 1: Dashboard UI
1. Go to Dashboard
2. Use the "Backend Configuration" panel
3. Click on "Python Backend" or "Node.js Backend"

### Method 2: Configuration File
Edit `frontend/src/config/api.js`:
```javascript
USE_PYTHON_BACKEND: true,  // true = Python, false = Node.js
```

## 📊 What's Working

### ✅ Python Backend (Port 5001)
- Real LSTM predictions
- Health check
- Model information
- Trend analysis
- No authentication required

### ✅ Frontend (Port 3000)
- Automatic backend detection
- Backend switcher UI
- All existing pages work
- Real-time predictions from LSTM model

### ⚠️ Node.js Backend (Port 5000)
- Full authentication system
- Database storage
- File uploads
- Mock prediction data (not real ML)

## 🎉 Success Indicators

You'll know everything is working when:

1. **Python Backend**: Shows "✅ Model and scaler loaded successfully"
2. **Frontend**: Loads without console errors
3. **Dashboard**: Shows "Python (LSTM Model)" as current backend
4. **Predictions**: Forecast page generates real predictions from your model
5. **Health Check**: Returns `{"status":"healthy","model_loaded":true}`

## 📞 Need Help?

1. Check the console logs in both terminals
2. Verify model file exists: `py-backend/models/model_weights.pth`
3. Test API endpoints with curl commands above
4. Check browser developer console for frontend errors

Your LSTM model is now powering the frontend! 🚀