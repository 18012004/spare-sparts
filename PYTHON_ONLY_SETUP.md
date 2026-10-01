# Python Backend Only Setup

This application now uses **only the Python backend** with LSTM model for predictions. All Node.js backend dependencies have been removed.

## 🚀 Quick Start

### 1. Start Python Backend

```bash
cd py-backend

# Install dependencies (first time)
pip install -r requirements.txt

# Copy your model file to models/model_weights.pth
# Or run setup helper:
python setup_model.py

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
cd frontend

# Install dependencies (first time)
npm install

# Start React app
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
```

### 3. Access Application

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/health`

## 🎯 Features

### ✅ **Working Features**
- **Real LSTM Predictions**: Your trained model powers all forecasts
- **Dashboard**: Overview with mock data and backend status
- **Forecast**: Real predictions using your LSTM model
- **Trend Analysis**: Analyze historical data patterns
- **Backend Status**: Real-time monitoring of Python backend
- **Authentication**: Simulated (no real auth needed)

### 📊 **Available Pages**
1. **Dashboard**: Stats overview and backend status
2. **Forecast**: LSTM-powered predictions
3. **Upload**: Demo file processing (local only)
4. **Alerts**: Mock inventory alerts
5. **EDA**: Exploratory data analysis with mock data

## 🔧 **Backend Status Monitor**

The Dashboard includes a real-time backend status monitor showing:
- ✅ **Connection Status**: Python backend connectivity
- ✅ **Model Status**: LSTM model loading status
- ✅ **Scaler Status**: Data preprocessing readiness
- ✅ **Predictor Status**: Prediction system readiness

## 📡 **API Endpoints**

### Python Backend (Port 5001)
- `GET /health` - Backend health check
- `GET /model-info` - Model configuration details
- `POST /predict` - Multiple day predictions
- `POST /predict-single` - Single prediction
- `POST /predict-weekly` - Weekly predictions
- `POST /analyze-trends` - Trend analysis

### Example API Call
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "historical_data": [45, 52, 48, 61, 55, 67, 71, 63, 58, 72],
    "prediction_days": 7
  }'
```

## 🛠️ **Configuration**

### Backend URL
Edit `frontend/src/config/api.js`:
```javascript
const API_CONFIG = {
  BACKEND_URL: 'http://localhost:5001', // Change if needed
  // ...
};
```

### Model Requirements
- **Model File**: `py-backend/models/model_weights.pth`
- **Architecture**: LSTM (input_size=1, hidden_size=64, num_layers=2)
- **Scaler**: MinMaxScaler (auto-created if missing)

## 🔍 **Troubleshooting**

### Backend Not Starting
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies
cd py-backend
pip install -r requirements.txt

# Check model file
ls models/model_weights.pth
```

### Frontend Errors
```bash
# Clear cache and restart
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Connection Issues
```bash
# Test backend directly
curl http://localhost:5001/health

# Expected response:
# {"status":"healthy","model_loaded":true,"scaler_loaded":true,"predictor_ready":true}
```

## 📈 **Testing Predictions**

### Via Frontend
1. Go to **Forecast** page
2. Select a spare part
3. Set prediction period
4. Click "Run Forecast"
5. View LSTM predictions

### Via API
```bash
# Single prediction
curl -X POST http://localhost:5001/predict-single \
  -H "Content-Type: application/json" \
  -d '{"historical_data": [20,25,22,28,30,26,24,32,29,27,31,23,26,28]}'

# Weekly predictions
curl -X POST http://localhost:5001/predict-weekly \
  -H "Content-Type: application/json" \
  -d '{"historical_data": [20,25,22,28,30,26,24,32,29,27,31,23,26,28], "weeks_ahead": 4}'
```

## 🎉 **Success Indicators**

You'll know everything is working when:

1. ✅ **Backend Status**: Dashboard shows "Healthy (Model Loaded)"
2. ✅ **No Errors**: Clean browser console
3. ✅ **Predictions Work**: Forecast page generates real predictions
4. ✅ **API Responds**: Health check returns success
5. ✅ **Model Loaded**: Backend status shows all green checkmarks

## 📝 **What Changed**

### Removed
- ❌ Node.js backend dependencies
- ❌ Backend switching logic
- ❌ MongoDB connections
- ❌ Real authentication system
- ❌ File upload to database

### Simplified
- ✅ Single Python backend only
- ✅ Simulated authentication
- ✅ Mock data for non-ML features
- ✅ Real LSTM predictions
- ✅ Streamlined configuration

## 🚀 **Next Steps**

1. **Model Training**: Retrain with more data for better accuracy
2. **Data Integration**: Connect to real inventory database
3. **Authentication**: Add real user management if needed
4. **Deployment**: Deploy to cloud platform
5. **Monitoring**: Add logging and metrics

Your LSTM model is now the core of the application! 🎯