# Users Page - Troubleshooting Guide

## ✅ What Was Fixed

### 1. **Date Serialization Issue**
- Fixed `created_at`, `updated_at`, `last_login` to be JSON serializable
- Converted datetime objects to ISO format strings
- Added null checks for missing fields

### 2. **Better Error Handling**
- Added detailed error messages in frontend
- Shows troubleshooting steps
- Added "Test Database Connection" button
- Console logging for debugging

### 3. **Improved User Model**
- Added `.get()` with defaults for all fields
- Handles missing fields gracefully
- Returns proper JSON format

---

## 🔍 Troubleshooting Steps

### Step 1: Check Backend is Running

Open browser and go to:
```
http://localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database_connected": true,
  "arima_available": true,
  "sarima_available": true,
  "holt_winters_available": true,
  "ensemble_ready": true
}
```

If `database_connected` is `false`, MongoDB is not connected!

---

### Step 2: Test Database Connection

Open browser and go to:
```
http://localhost:5001/api/test-db
```

**Expected Response:**
```json
{
  "status": "connected",
  "database": "spare-parts-db",
  "collections": {
    "users": 2,
    "purchase_requests": 0
  },
  "message": "Database is working correctly"
}
```

If you see an error, MongoDB connection is the problem.

---

### Step 3: Check if You Have Users

If database is connected but shows 0 users, you need to create users first!

**Create Admin User:**
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin",
    "name": "Test Admin"
  }'
```

**Create Staff User:**
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@test.com",
    "password": "staff123",
    "role": "staff",
    "name": "Test Staff"
  }'
```

---

### Step 4: Test Users Endpoint Directly

Get your token first (login), then:

```bash
curl -X GET http://localhost:5001/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@test.com",
      "role": "admin",
      "name": "Test Admin",
      "created_at": "2025-01-09T10:30:00",
      "updated_at": "2025-01-09T10:30:00",
      "last_login": "2025-01-09T11:00:00"
    }
  ],
  "total": 1,
  "message": "Users fetched successfully"
}
```

---

### Step 5: Check Browser Console

1. Open Users page
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for errors
5. Check Network tab for API response

**Common Errors:**

**Error: "Admin access required"**
- You're not logged in as admin
- Login with admin account

**Error: "Failed to fetch users"**
- Backend not running
- MongoDB not connected
- Network issue

**Error: "Token has expired"**
- Your login token expired
- Logout and login again

---

## 🔧 Quick Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
python run.py
```

### Fix 2: Check MongoDB Connection

Open `backend/.env` and verify:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spare-parts-db
DATABASE_NAME=spare-parts-db
```

### Fix 3: Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page (Ctrl+F5)

### Fix 4: Check Token
Open browser console and type:
```javascript
localStorage.getItem('token')
```

If null, you need to login again.

### Fix 5: Verify Admin Role
```javascript
// In browser console
const token = localStorage.getItem('token');
fetch('http://localhost:5001/api/auth/verify', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('User role:', d.user.role));
```

Should show: `User role: admin`

---

## 🎯 Using the Test Button

On the Users page, if you see an error, click the **"Test Database Connection"** button.

**If successful:**
```
Database Status: {
  "status": "connected",
  "database": "spare-parts-db",
  "collections": {
    "users": 2
  }
}
```

**If failed:**
```
Database test failed: Network Error
```

This tells you if the problem is:
- Backend not running
- MongoDB not connected
- Network issue

---

## 📊 Expected Users Page View

### When Working Correctly:

```
┌─────────────────────────────────────────────┐
│  User Management              [Refresh]     │
├─────────────────────────────────────────────┤
│  Registered Users (2)                       │
├─────────────────────────────────────────────┤
│  USER          EMAIL           ROLE         │
├─────────────────────────────────────────────┤
│  [A] Admin     admin@test.com  ADMIN        │
│  ID: 507f1f77bcf86cd799439011              │
│  Created: 2025-01-09                        │
├─────────────────────────────────────────────┤
│  [S] Staff     staff@test.com  STAFF        │
│  ID: 507f1f77bcf86cd799439012              │
│  Created: 2025-01-09                        │
└─────────────────────────────────────────────┘
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch users"

**Causes:**
- Backend not running
- MongoDB not connected
- Wrong endpoint URL

**Solution:**
1. Check backend is running: `http://localhost:5001/health`
2. Check database: `http://localhost:5001/api/test-db`
3. Restart backend if needed

---

### Issue 2: "Admin access required"

**Causes:**
- Logged in as staff, not admin
- Token expired
- Wrong user role

**Solution:**
1. Logout
2. Login with admin account
3. Check role in browser console

---

### Issue 3: "Registered Users (0)"

**Causes:**
- No users in database
- Database connection issue
- Wrong database name

**Solution:**
1. Create users via signup
2. Check database name in `.env`
3. Verify MongoDB Atlas has data

---

### Issue 4: Page Shows Loading Forever

**Causes:**
- Backend not responding
- Network timeout
- CORS issue

**Solution:**
1. Check backend logs
2. Check browser console for CORS errors
3. Restart backend
4. Check firewall/antivirus

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] Backend is running (`python backend/run.py`)
- [ ] MongoDB is connected (check backend logs)
- [ ] You're logged in as admin
- [ ] Token is not expired
- [ ] At least one user exists in database
- [ ] Browser console shows no errors
- [ ] `/api/test-db` endpoint works
- [ ] `/health` endpoint shows database_connected: true

---

## 🆘 Still Not Working?

### Check Backend Logs:

Look for these messages:
```
✅ Database connected successfully
✅ ARIMA, SARIMA, and Holt-Winters models ready
```

If you see:
```
⚠️ Database connection failed
```

Then MongoDB is the problem!

### Check MongoDB Atlas:

1. Go to MongoDB Atlas dashboard
2. Check if cluster is running
3. Check if IP is whitelisted (0.0.0.0/0 for testing)
4. Check if database user has permissions
5. Verify connection string is correct

---

## 📝 Summary

**What Was Fixed:**
1. ✅ Date serialization (datetime → ISO string)
2. ✅ Better error handling
3. ✅ Test database button
4. ✅ Detailed error messages
5. ✅ Null checks for missing fields

**How to Test:**
1. Restart backend
2. Login as admin
3. Go to Users page
4. Should see all users
5. If error, click "Test Database Connection"

**Your Users page should now work correctly!** 🎉
