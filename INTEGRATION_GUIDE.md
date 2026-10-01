# Python Backend Integration Guide

This guide explains how to integrate the Python Flask backend with the existing React frontend.

## Overview

The application now supports two backends:
- **Python Backend (Port 5001)**: Uses trained LSTM model for real predictions
- **Node.js Backend (Port 5000)**: Full-featured backend with database and authentication

## Quick Start

### 1. Setup Python Backend

#### Windows:
```bash
# Run the startup script
start-python-backend.bat
```

#### Linux/Mac:
```bash
# Make script executable and run
chmod +x start-python-backend.sh
./start-python-backend.sh
```

#### Manual Setup:
```bash
cd py-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy your model file to models/model_weights.pth
# Or run the setup helper:
python setup_model.py

# Start the server
python app.py
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Backend Switching

The frontend automatically uses the Python backend by default. You can switch backends using:

1. **Dashboard Backend Switcher**: Available on the Dashboard page
2. **Configuration File**: Edit `frontend/src/config/api.js`
   ```javascript
   USE_PYTHON_BACKEND: true  // Set to false for Node.js backend
   ```

## Architecture

### API Service Layer

The integration uses a service layer (`frontend/src/services/apiService.js`) that:
- Automatically routes requests to the correct backend
- Handles different response formats
- Provides mock data for missing endpoints
- Manages authentication differences

### Configuration

Backend selection is controlled by `frontend/src/config/api.js`:

```javascript
const API_CONFIG = {
  USE_PYTHON_BACKEND: true,
  PYTHON_BACKEND_URL: 'http://localhost:5001',
  NODE_BACKEND_URL: 'http://localhost:5000',
  // ... endpoint mappings
};
```

## API Endpoint Mapping

| Frontend Feature | Python Endpoint | Node.js Endpoint |
|-----------------|----------------|------------------|
| Health Check | `/health` | `/health` |
| Single Prediction | `/predict-single` | `/api/forecast` |
| Multiple Predictions | `/predict` | `/api/forecast` |
| Weekly Predictions | `/predict-weekly` | `/api/forecast` |
| Trend Analysis | `/analyze-trends` | `/api/eda` |
| Authentication | Mock (no auth) | `/api/auth/*` |
| Dashboard Stats | Mock data | `/api/dashboard/stats` |
| Parts List | Mock data | `/api/parts` |

## Data Format Conversion

The API service automatically converts between formats:

### Python Backend Input:
```javascript
{
  "historical_data": [45, 52, 48, 61, 55, 67, 71, 63, 58, 72],
  "prediction_days": 7
}
```

### Node.js Backend Input:
```javascript
{
  "part": "ENGINE OIL",
  "monthsAhead": 3
}
```

### Unified Frontend Format:
The service layer converts both to a consistent format for the UI.

## Features by Backend

### Python Backend Features:
- ✅ Real LSTM model predictions
- ✅ Single predictions
- ✅ Multiple day predictions  
- ✅ Weekly predictions
- ✅ Trend analysis
- ✅ Model information
- ❌ Authentication
- ❌ File upload
- ❌ Database storage

### Node.js Backend Features:
- ✅ Authentication system
- ✅ Database storage
- ✅ File upload
- ✅ Full CRUD operations
- ✅ Alert system
- ❌ Real ML predictions (uses mock data)

## Authentication Handling

### Python Backend:
- No authentication required
- Simulates login for UI compatibility
- All users have admin access

### Node.js Backend:
- Full JWT authentication
- User roles and permissions
- Protected routes

## Model Requirements

For the Python backend to work, you need:

1. **Model File**: `py-backend/models/model_weights.pth`
   - PyTorch LSTM model state dictionary
   - Architecture: input_size=1, hidden_size=64, num_layers=2

2. **Scaler File** (optional): `py-backend/models/scaler.pkl`
   - Fitted MinMaxScaler for data preprocessing
   - Created automatically if not provided

## Troubleshooting

### Python Backend Issues:

1. **Model not loading**:
   ```bash
   # Check if model file exists
   ls py-backend/models/model_weights.pth
   
   # Run setup helper
   cd py-backend
   python setup_model.py
   ```

2. **Dependencies missing**:
   ```bash
   cd py-backend
   pip install -r requirements.txt
   ```

3. **Port conflicts**:
   - Change port in `py-backend/config.py`
   - Update `frontend/src/config/api.js`

### Frontend Issues:

1. **Backend not switching**:
   - Check `frontend/src/config/api.js`
   - Refresh the page after switching
   - Check browser console for errors

2. **CORS errors**:
   - Ensure both backends are running
   - Check CORS configuration in backend

### Health Check:

Test backend connectivity:
```bash
# Python backend
curl http://localhost:5001/health

# Node.js backend  
curl http://localhost:5000/health
```

## Development Workflow

### Using Python Backend:
1. Start Python backend: `python py-backend/app.py`
2. Start frontend: `npm start` (in frontend directory)
3. Use Dashboard switcher or config to select Python backend
4. Test predictions with real LSTM model

### Using Node.js Backend:
1. Start Node.js backend: `npm start` (in backend directory)
2. Start frontend: `npm start` (in frontend directory)  
3. Use Dashboard switcher or config to select Node.js backend
4. Full authentication and database features available

### Switching Between Backends:
1. Use the Backend Switcher on the Dashboard
2. Or edit `frontend/src/config/api.js`
3. Refresh the page to apply changes

## Production Deployment

### Environment Variables:

**Python Backend** (`.env`):
```
DEBUG=False
HOST=0.0.0.0
PORT=5001
MODEL_PATH=models/model_weights.pth
```

**Frontend** (build time):
```
REACT_APP_USE_PYTHON_BACKEND=true
REACT_APP_PYTHON_BACKEND_URL=https://your-python-api.com
REACT_APP_NODE_BACKEND_URL=https://your-node-api.com
```

### Docker Deployment:

```dockerfile
# Python Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY py-backend/ .
RUN pip install -r requirements.txt
EXPOSE 5001
CMD ["python", "app.py"]
```

## Next Steps

1. **Model Training**: Retrain your LSTM model with more data
2. **Feature Enhancement**: Add more prediction types to Python backend
3. **Hybrid Approach**: Use Python for predictions, Node.js for everything else
4. **Performance**: Add caching and optimization
5. **Monitoring**: Add logging and metrics collection

## Support

For issues:
1. Check the troubleshooting section
2. Verify model files are in correct location
3. Check backend health endpoints
4. Review browser console for frontend errors
5. Check server logs for backend errors