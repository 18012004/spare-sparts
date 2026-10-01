# Authentication Testing Guide

This guide helps you test the complete MongoDB authentication integration.

## 🚀 Setup and Start

### 1. Start the Flask Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Create sample users (optional)
python create_admin.py
# Choose option 2 for sample users

# Start the Flask server
python flask_app.py
```

**Expected Output:**
```
✅ Database connected successfully
✅ ML model initialized successfully
🚀 Starting Flask API server...
* Running on http://0.0.0.0:5001
```

### 2. Start the Frontend
```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
```

## 🔐 Authentication Testing

### Test 1: Login Page
1. **Open Browser**: Go to `http://localhost:3000`
2. **Login Page**: Should show login form with sample credentials
3. **Sample Credentials**: 
   - Admin: `admin@spareparts.com` / `admin123`
   - Staff: `staff@spareparts.com` / `staff123`

### Test 2: Quick Login Buttons
1. **Click "Use Admin"**: Should auto-fill admin credentials
2. **Click "Use Staff"**: Should auto-fill staff credentials
3. **Login**: Click "Sign in" to authenticate

### Test 3: User Registration
1. **Click "Don't have an account? Sign up"**
2. **Fill Form**: Enter new email, password, select role
3. **Create Account**: Should register and auto-login
4. **Verification**: Check if user appears in Users page (admin only)

### Test 4: Dashboard Access
1. **After Login**: Should redirect to dashboard
2. **User Info**: Navbar should show user name, email, role
3. **Backend Status**: Should show "Database: ✅" and user info
4. **Navigation**: Sidebar should show appropriate menu items

### Test 5: Role-based Access
#### Admin User:
- ✅ Can see all menu items (Dashboard, Forecast, Upload, Alerts, EDA, Users)
- ✅ Can access Upload Data page
- ✅ Can access Users management page
- ✅ Can view all registered users

#### Staff User:
- ✅ Can see limited menu items (Dashboard, Forecast, Alerts, EDA)
- ❌ Cannot see Upload Data or Users in sidebar
- ❌ Gets "Admin Access Required" if accessing `/upload` or `/users` directly

### Test 6: Protected API Endpoints
1. **Open Browser DevTools** → Network tab
2. **Go to Forecast Page**
3. **Run Prediction**: Should see API calls with `Authorization: Bearer <token>` header
4. **Check Response**: Should get real LSTM predictions

### Test 7: Token Management
1. **Login Successfully**: Token stored in localStorage
2. **Refresh Page**: Should stay logged in (token verification)
3. **Wait 1 Hour**: Token should expire, auto-logout
4. **Manual Logout**: Should clear token and redirect to login

## 🧪 API Testing with curl

### Test Authentication Endpoints

#### Login Test
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spareparts.com",
    "password": "admin123"
  }'
```

**Expected Response:**
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

#### Protected Endpoint Test
```bash
# Replace <TOKEN> with actual token from login response
curl -X POST http://localhost:5001/predict-single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "historical_data": [20, 25, 22, 28, 30, 26, 24, 32, 29, 27, 31, 23, 26, 28]
  }'
```

#### Unauthorized Test
```bash
# Without token - should fail
curl -X POST http://localhost:5001/predict-single \
  -H "Content-Type: application/json" \
  -d '{
    "historical_data": [20, 25, 22, 28, 30]
  }'
```

**Expected Response:**
```json
{
  "message": "Authorization token is required"
}
```

## 🔍 Troubleshooting

### Backend Issues

#### MongoDB Connection Failed
```bash
# Check environment variables
cat .env | grep MONGODB

# Test connection manually
python -c "from models.database import db; db.connect(); print('✅ Connected')"
```

#### JWT Token Issues
```bash
# Check JWT secret is set
cat .env | grep JWT_SECRET_KEY

# Verify token manually
python -c "
import jwt
import os
from dotenv import load_dotenv
load_dotenv()
token = 'YOUR_TOKEN_HERE'
secret = os.getenv('JWT_SECRET_KEY')
try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print('✅ Token valid:', decoded)
except Exception as e:
    print('❌ Token invalid:', e)
"
```

### Frontend Issues

#### Login Not Working
1. **Check Network Tab**: Look for 401/500 errors
2. **Check Console**: Look for JavaScript errors
3. **Clear Storage**: Remove old tokens from localStorage
4. **Verify Backend**: Ensure Flask server is running on port 5001

#### Protected Routes Failing
1. **Check Token**: Verify token exists in localStorage
2. **Check Headers**: Ensure Authorization header is sent
3. **Check Expiry**: Token expires after 1 hour by default

### Database Issues

#### Users Not Created
```bash
# Manually create admin user
python create_admin.py

# Check MongoDB directly
python -c "
from models.database import db
users = db.get_collection('users')
for user in users.find():
    print(user['email'], user['role'])
"
```

## ✅ Success Checklist

### Backend Health
- [ ] Flask server starts without errors
- [ ] MongoDB connection successful
- [ ] LSTM model loads correctly
- [ ] JWT authentication working
- [ ] Sample users created

### Frontend Integration
- [ ] Login page displays correctly
- [ ] Sample credentials work
- [ ] User registration works
- [ ] Dashboard shows user info
- [ ] Role-based menu filtering works
- [ ] Protected routes require authentication

### API Security
- [ ] All prediction endpoints require JWT token
- [ ] Invalid tokens are rejected
- [ ] Token expiry works correctly
- [ ] Role-based access control works

### User Experience
- [ ] Smooth login/logout flow
- [ ] Clear error messages
- [ ] Persistent sessions (refresh page stays logged in)
- [ ] Automatic logout on token expiry
- [ ] Admin vs Staff role differences visible

## 🎯 Expected User Flow

1. **Visit App** → Login page with sample credentials
2. **Login** → Dashboard with user info and backend status
3. **Navigate** → Role-appropriate menu items
4. **Use Predictions** → Real LSTM predictions with authentication
5. **Admin Features** → Upload data, manage users (admin only)
6. **Logout** → Return to login page

## 📊 Monitoring

### Check Active Sessions
```bash
# View all users in database
python -c "
from models.user import User
users = User.get_all_users()
for user in users:
    print(f'{user[\"email\"]} - {user[\"role\"]} - Created: {user[\"created_at\"]}')
"
```

### Check Backend Logs
- Flask server logs show authentication attempts
- MongoDB connection status
- JWT token validation results
- API endpoint access logs

Your authentication system is now fully integrated! 🎉