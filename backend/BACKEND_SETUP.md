# Backend Setup Instructions

## 🚀 Quick Start

### Option 1: Use Batch File (Windows)
```bash
cd backend
start.bat
```

### Option 2: Manual Setup
```bash
cd backend

# Install requirements
pip install -r requirements.txt

# Create sample users
python create_admin.py

# Start the server
python app.py
```

### Option 3: Use Startup Script
```bash
cd backend
python start_backend.py
```

## 📋 Sample Users

After running the setup, you can login with:
- **Admin**: admin@spareparts.com / admin123
- **Staff**: staff@spareparts.com / staff123

## 🔧 Configuration

The `.env` file contains:
```env
MONGODB_URI=mongodb+srv://nithishkumarb18:Root@spare-parts-db.rijogg8.mongodb.net/?appName=spare-parts-db
DATABASE_NAME=spare-parts-db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-2024
JWT_ACCESS_TOKEN_EXPIRES=3600
HOST=0.0.0.0
PORT=5001
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

## 🎯 Expected Output

When successful, you should see:
```
✅ Connected to MongoDB database: spare-parts-db
✅ Database connected successfully
✅ ML model initialized successfully (if model files exist)
🚀 Starting Flask API server...
* Running on http://0.0.0.0:5001
```

## 🔍 Health Check

Test the backend:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "database_connected": true,
  "model_loaded": true,
  "scaler_loaded": true,
  "predictor_ready": true
}
```

## 🚨 Troubleshooting

### Missing Flask
```bash
pip install flask flask-cors flask-jwt-extended
```

### MongoDB Connection Issues
- Check your internet connection
- Verify the MongoDB URI in .env file
- Ensure MongoDB Atlas allows connections from your IP

### Missing Model Files
- The backend will start without model files
- Predictions won't work until you add your trained model
- Copy your model to `models/model_weights.pth`

## 📡 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /model-info` - Model information

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/users` - Get all users (admin only)

### Protected Endpoints (require JWT token)
- `POST /predict` - Multiple predictions
- `POST /predict-single` - Single prediction
- `POST /predict-weekly` - Weekly predictions
- `POST /analyze-trends` - Trend analysis

## 🎉 Success!

If everything works:
1. Backend starts on port 5001
2. MongoDB connection successful
3. Sample users created
4. Frontend can authenticate and make predictions