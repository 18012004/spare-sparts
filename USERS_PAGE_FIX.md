# Users Page & Purchase Request - Complete Fix

## ✅ What Was Fixed

### 1. **Auth Routes File Corrupted**
- Fixed syntax error in `backend/routes/auth.py` line 12
- Email validation regex was broken
- Now properly formatted

### 2. **Better Error Handling**
- Added detailed error messages
- Added traceback for debugging
- Added alternative `/api/users` endpoint

### 3. **Purchase Request System**
- Complete workflow implemented
- Role-based access control
- Staff → Admin approval flow

---

## 🔍 Troubleshooting Users Page

### Step 1: Check Backend is Running
```bash
# You should see:
✅ Database connected successfully
✅ ARIMA, SARIMA, and Holt-Winters models ready for forecasting
```

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

### Step 3: Check if You're Logged in as Admin
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('token')`
4. If null, you need to login

### Step 4: Verify Your Role
Go to:
```
http://localhost:5001/api/auth/verify
```
With Authorization header containing your token

**Should return:**
```json
{
  "user": {
    "role": "admin"  // Must be "admin" not "staff"
  }
}
```

### Step 5: Test Users Endpoint Directly
```bash
# Replace YOUR_TOKEN with actual token
curl -X GET http://localhost:5001/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Quick Fix Steps

### If Users Page Still Not Working:

**1. Restart Backend:**
```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
python run.py
```

**2. Clear Browser Cache:**
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page (Ctrl+F5)

**3. Check MongoDB Connection:**
- Make sure MongoDB Atlas is accessible
- Check if IP is whitelisted
- Verify connection string in `.env`

**4. Create Test User:**
```bash
# Use signup endpoint to create admin user
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin",
    "name": "Test Admin"
  }'
```

---

## 📱 Purchase Request System Usage

### For Frontend Integration:

**1. In Alerts Page (Staff View):**

```javascript
// Add this button in your alerts
<button 
  onClick={() => triggerPurchaseRequest(partName, quantity)}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Request Purchase
</button>

// Function to trigger purchase request
const triggerPurchaseRequest = async (partName, quantity) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/purchase-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        part_name: partName,
        quantity: quantity,
        reason: 'High demand alert - forecasted increase'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✅ Purchase request sent to admin!');
      // Refresh alerts or show success message
    } else {
      alert('❌ Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create purchase request');
  }
};
```

**2. Create Purchase Requests Page (Admin View):**

```javascript
// Create new file: frontend/src/pages/PurchaseRequests.js

import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await apiService.api.get('/api/purchase-requests');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await apiService.api.post(`/api/purchase-requests/${requestId}/approve`);
      alert('✅ Request approved!');
      fetchRequests(); // Refresh list
    } catch (error) {
      alert('❌ Error approving request');
    }
  };

  const rejectRequest = async (requestId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      await apiService.api.post(`/api/purchase-requests/${requestId}/reject`, {
        reason
      });
      alert('❌ Request rejected');
      fetchRequests(); // Refresh list
    } catch (error) {
      alert('Error rejecting request');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Purchase Requests</h1>
      
      <div className="bg-white shadow rounded-lg">
        {requests.map(req => (
          <div key={req.id} className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{req.part_name}</h3>
                <p className="text-gray-600">Quantity: {req.quantity}</p>
                <p className="text-sm text-gray-500">
                  Requested by: {req.requested_by.name} ({req.requested_by.email})
                </p>
                <p className="text-sm text-gray-500">
                  Reason: {req.reason}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {req.status === 'approved' && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                    ✅ Approved
                  </span>
                )}
                {req.status === 'rejected' && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded">
                    ❌ Rejected
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseRequests;
```

**3. Add Route in App.js:**

```javascript
import PurchaseRequests from './pages/PurchaseRequests';

// In your routes:
<Route path="/purchase-requests" element={<PurchaseRequests />} />
```

**4. Add to Sidebar:**

```javascript
// In Sidebar.js, add:
{user?.role === 'admin' && (
  <Link to="/purchase-requests" className="...">
    📋 Purchase Requests
  </Link>
)}
```

---

## 🎯 Testing the Complete Flow

### Test as Staff:
1. Login as staff user
2. Go to Alerts page
3. Click "Request Purchase" on any alert
4. Should see success message
5. Go to Purchase Requests page (if staff can view their own)

### Test as Admin:
1. Login as admin user
2. Go to Purchase Requests page
3. See all requests from all staff
4. Click "Approve" or "Reject"
5. Request status updates

---

## 📊 API Endpoints Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/users` | GET | Admin | Get all users |
| `/api/users` | GET | Admin | Alternative users endpoint |
| `/api/test-db` | GET | Public | Test database connection |
| `/api/purchase-requests` | POST | All | Create purchase request |
| `/api/purchase-requests` | GET | All | Get requests (filtered by role) |
| `/api/purchase-requests/:id/approve` | POST | Admin | Approve request |
| `/api/purchase-requests/:id/reject` | POST | Admin | Reject request |

---

## ✅ Checklist

Before testing, make sure:
- [ ] Backend is running (`python backend/run.py`)
- [ ] MongoDB is connected (check logs)
- [ ] You're logged in as admin
- [ ] Browser cache is cleared
- [ ] CORS is enabled
- [ ] Token is valid (not expired)

---

## 🆘 Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check browser console** - Look for network errors
3. **Test with curl** - Verify endpoints work
4. **Check MongoDB** - Verify data exists
5. **Restart everything** - Backend, frontend, browser

---

**Both issues should now be fixed! 🎉**
