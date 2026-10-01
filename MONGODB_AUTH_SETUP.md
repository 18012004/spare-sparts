# MongoDB Authentication Setup Guide

This guide shows how to set up the Python Flask backend with MongoDB authentication integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

The `.env` file is already configured with your MongoDB connection:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://nithishkumarb18:Root@spare-parts-db.rijogg8.mongodb.net/?appName=spare-parts-db
DATABASE_NAME=spare-parts-db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-2024
JWT_ACCESS_TOKEN_EXPIRES=3600
```

### 3. Create Admin User

```bash
python create_admin.py
```

Choose option 2 to create sample users:
- **Admin**: admin@spareparts.com / admin123
- **Staff**: staff@spareparts.com / staff123

### 4. Start Backend

```bash
python start_flask_backend.py
```

Or directly:
```bash
python flask_app.py
```

### 5. Start Frontend

```bash
cd frontend
npm start
```

## 🔧 Architecture

### Backend Structure
```
├── flask_app.py              # Main Flask application
├── config.py                 # Configuration settings
├── model_loader.py           # LSTM model loader
├── predictor.py              # Prediction logic
├── models/
│   ├── database.py           # MongoDB connection
│   └── user.py               # User model and auth
├── routes/
│   └── auth.py               # Authentication routes
└── .env                      # Environment configuration
```

### Authentication Flow
1. **Registration**: User creates account via `/api/auth/signup`
2. **Login**: User authenticates via `/api/auth/login`
3. **JWT Token**: Server returns JWT token for authenticated requests
4. **Protected Routes**: All prediction endpoints require valid JWT token
5. **Token Verification**: Frontend sends token in Authorization header

## 📡 API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/users` - Get all users (admin only)

### Prediction Endpoints (Protected)
- `POST /predict-single` - Single prediction
- `POST /predict` - Multiple predictions
- `POST /predict-weekly` - Weekly predictions
- `POST /analyze-trends` - Trend analysis

### Public Endpoints
- `GET /health` - Health check
- `GET /model-info` - Model information

## 🔐 Authentication Examples

### Login Request
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spareparts.com",
    "password": "admin123"
  }'
```

### Response
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@spareparts.com",
    "role": "admin",
    "name": "System Administrator"
  }
}
```

### Protected Request
```bash
curl -X POST http://localhost:5001/predict-single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "historical_data": [20, 25, 22, 28, 30, 26, 24, 32, 29, 27, 31, 23, 26, 28]
  }'
```

## 🎯 Frontend Integration

### Updated Features
1. **Real Authentication**: Login/signup with MongoDB validation
2. **JWT Token Management**: Automatic token handling in API calls
3. **Protected Routes**: All prediction features require authentication
4. **User Roles**: Admin and staff role support
5. **Session Management**: Automatic logout on token expiry

### Login Process
1. User enters email/password on frontend
2. Frontend sends credentials to `/api/auth/login`
3. Backend validates against MongoDB
4. Backend returns JWT token and user info
5. Frontend stores token and redirects to dashboard
6. All subsequent API calls include JWT token

## 🛠️ Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId("..."),
  "email": "admin@spareparts.com",
  "password": "$2b$12$...", // bcrypt hashed
  "role": "admin", // "admin" or "staff"
  "name": "System Administrator",
  "created_at": ISODate("..."),
  "updated_at": ISODate("..."),
  "last_login": ISODate("...")
}
```

## 🔒 Security Features

### Password Security
- **Bcrypt Hashing**: All passwords hashed with bcrypt
- **Salt Rounds**: Secure salt generation
- **No Plain Text**: Passwords never stored in plain text

### JWT Security
- **Secret Key**: Configurable JWT secret key
- **Expiration**: Configurable token expiration (default 1 hour)
- **Bearer Token**: Standard Authorization header format

### Input Validation
- **Email Format**: Valid email format required
- **Password Strength**: Minimum 6 characters
- **Role Validation**: Only "admin" or "staff" roles allowed

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
python -c "from models.database import db; db.connect(); print('✅ Connected')"
```

### Authentication Issues
```bash
# Create test user
python create_admin.py

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spareparts.com", "password": "admin123"}'
```

### Frontend Issues
1. **Clear browser storage**: Remove old tokens
2. **Check network tab**: Verify API calls
3. **Check console**: Look for JavaScript errors

## 📊 Testing

### Health Check
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

### Complete Flow Test
1. Start backend: `python flask_app.py`
2. Start frontend: `cd frontend && npm start`
3. Open browser: `http://localhost:3000`
4. Login with: admin@spareparts.com / admin123
5. Test predictions on Forecast page

## 🎉 Success Indicators

✅ **Backend**: Shows "Database connected successfully"  
✅ **Frontend**: Login page appears  
✅ **Authentication**: Can login with sample credentials  
✅ **Predictions**: Forecast page works with real LSTM model  
✅ **Security**: All prediction endpoints require authentication  

Your application now has full MongoDB authentication integrated with the LSTM prediction system! 🚀