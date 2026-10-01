# Admin Purchase Requests - Complete Setup Guide

## ✅ What Was Created

### 1. **New Page: Purchase Requests**
- Location: `frontend/src/pages/PurchaseRequests.js`
- Separate page for Admin to view and manage all purchase requests
- Filter by status (All, Pending, Approved, Rejected)
- Approve/Reject functionality

### 2. **Updated Alerts Page**
- Staff can click "Request Purchase" button
- Creates purchase request with predicted quantity
- Sends to admin for approval

---

## 🚀 Setup Instructions

### Step 1: Add Route to App.js

Open `frontend/src/App.js` and add the import and route:

```javascript
// Add import at the top
import PurchaseRequests from './pages/PurchaseRequests';

// Add route in your Routes section
<Route path="/purchase-requests" element={<PurchaseRequests />} />
```

**Complete example:**
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Alerts from './pages/Alerts';
import Upload from './pages/Upload';
import Users from './pages/Users';
import PurchaseRequests from './pages/PurchaseRequests';  // ← ADD THIS
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/users" element={<Users />} />
        <Route path="/purchase-requests" element={<PurchaseRequests />} />  {/* ← ADD THIS */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
```

---

### Step 2: Add to Sidebar Navigation

Open `frontend/src/components/Sidebar.js` and add the link:

```javascript
// Add this in your navigation links section
{user?.role === 'admin' && (
  <Link
    to="/purchase-requests"
    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
      location.pathname === '/purchase-requests' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''
    }`}
  >
    <span className="mr-3 text-xl">📋</span>
    <span>Purchase Requests</span>
  </Link>
)}
```

**Complete Sidebar Example:**
```javascript
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg">
      <nav className="mt-5">
        <Link to="/dashboard" className="...">
          <span className="mr-3 text-xl">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link to="/forecast" className="...">
          <span className="mr-3 text-xl">📈</span>
          <span>Forecast</span>
        </Link>

        <Link to="/alerts" className="...">
          <span className="mr-3 text-xl">🚨</span>
          <span>Alerts</span>
        </Link>

        {/* ADD THIS - Purchase Requests (Admin Only) */}
        {user?.role === 'admin' && (
          <Link
            to="/purchase-requests"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
              location.pathname === '/purchase-requests' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''
            }`}
          >
            <span className="mr-3 text-xl">📋</span>
            <span>Purchase Requests</span>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/upload" className="...">
            <span className="mr-3 text-xl">📤</span>
            <span>Upload Data</span>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/users" className="...">
            <span className="mr-3 text-xl">👥</span>
            <span>Users</span>
          </Link>
        )}
      </nav>
    </div>
  );
};
```

---

## 🎯 How It Works

### **Staff Workflow:**

1. **Staff logs in** → Goes to Alerts page
2. **Sees high demand alert** for a spare part
3. **Clicks "Request Purchase"** button
4. **System creates purchase request** with:
   - Part name
   - Predicted quantity (rounded up)
   - Reason (high demand alert)
   - Requested by (staff info)
   - Status: "pending"
5. **Staff sees confirmation** "Purchase request sent to admin"
6. **Button changes** to "✓ Purchase Requested"

### **Admin Workflow:**

1. **Admin logs in** → Sees "Purchase Requests" in sidebar
2. **Clicks "Purchase Requests"** → Opens dedicated page
3. **Sees all requests** from all staff members
4. **Can filter by status:**
   - All requests
   - Pending (needs action)
   - Approved
   - Rejected
5. **For pending requests, admin can:**
   - Click "✅ Approve" → Request approved
   - Click "❌ Reject" → Enter reason → Request rejected
6. **Status updates immediately**
7. **Staff can see their request status** (if they have access)

---

## 📱 Features

### Purchase Requests Page Features:

✅ **Filter Tabs:**
- All requests
- Pending (with count)
- Approved (with count)
- Rejected (with count)

✅ **Request Cards Show:**
- Part name
- Quantity needed
- Reason for request
- Who requested (name, email, role)
- When requested
- Current status
- Approval/rejection details

✅ **Admin Actions:**
- Approve button (green)
- Reject button (red) with reason prompt
- Confirmation dialogs

✅ **Summary Statistics:**
- Total requests
- Pending count
- Approved count
- Rejected count

✅ **Real-time Updates:**
- Refresh button
- Auto-refresh after approve/reject

---

## 🎨 UI Preview

### Purchase Requests Page Layout:

```
┌─────────────────────────────────────────────────────┐
│  Purchase Requests                    [🔄 Refresh]  │
│  Review and manage purchase requests from staff     │
├─────────────────────────────────────────────────────┤
│  [All (5)] [⏳ Pending (2)] [✅ Approved (2)] [❌ Rejected (1)] │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ 🚨 ENGINE OIL                    [⏳ PENDING] │  │
│  │ Quantity: 50 units                            │  │
│  │ Reason: High demand alert                     │  │
│  │ Requested by: John Staff (staff@example.com)  │  │
│  │ Created: 2025-01-09 10:30 AM                  │  │
│  │                          [✅ Approve] [❌ Reject] │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ ✅ BRAKE PADS                   [✅ APPROVED] │  │
│  │ Quantity: 30 units                            │  │
│  │ Approved: 2025-01-09 11:00 AM by Admin User   │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Summary                                            │
│  [5 Total] [2 Pending] [2 Approved] [1 Rejected]   │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test as Staff:

1. Login as staff user
2. Go to Alerts page
3. Click "Request Purchase" on any alert
4. Should see: "✅ Purchase request sent to admin for approval!"
5. Button should change to "✓ Purchase Requested"

### Test as Admin:

1. Login as admin user
2. See "Purchase Requests" in sidebar
3. Click it → Opens purchase requests page
4. See all requests from staff
5. Click "Approve" on a pending request
6. Confirm → Should see success message
7. Request status changes to "Approved"
8. Try rejecting a request with a reason

---

## 🔧 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/purchase-requests` | POST | Create new purchase request |
| `/api/purchase-requests` | GET | Get all requests (filtered by role) |
| `/api/purchase-requests/:id/approve` | POST | Approve request (admin only) |
| `/api/purchase-requests/:id/reject` | POST | Reject request (admin only) |

---

## 📝 Database Schema

### Collection: `purchase_requests`

```javascript
{
  _id: ObjectId,
  part_name: "ENGINE OIL",
  quantity: 50,
  reason: "High demand alert - Predicted increase of 45.5 units",
  requested_by: {
    id: "user123",
    name: "John Staff",
    email: "staff@example.com",
    role: "staff"
  },
  status: "pending", // or "approved" or "rejected"
  created_at: ISODate("2025-01-09T10:30:00Z"),
  updated_at: ISODate("2025-01-09T10:30:00Z"),
  
  // If approved:
  approved_by: {
    id: "admin123",
    name: "Admin User",
    email: "admin@example.com"
  },
  approved_at: ISODate("2025-01-09T11:00:00Z"),
  
  // If rejected:
  rejected_by: {
    id: "admin123",
    name: "Admin User",
    email: "admin@example.com"
  },
  rejection_reason: "Insufficient budget",
  rejected_at: ISODate("2025-01-09T11:00:00Z")
}
```

---

## ✅ Checklist

Before testing, make sure:

- [ ] Backend is running (`python backend/run.py`)
- [ ] Frontend is running (`npm start`)
- [ ] MongoDB is connected
- [ ] You have both admin and staff users
- [ ] PurchaseRequests.js file is created
- [ ] Route added to App.js
- [ ] Sidebar link added
- [ ] Alerts.js updated with new purchase request function

---

## 🎉 Summary

**What You Now Have:**

1. ✅ **Separate Admin Page** for purchase requests
2. ✅ **Staff can request** purchases from Alerts page
3. ✅ **Admin can approve/reject** with reasons
4. ✅ **Filter by status** (pending, approved, rejected)
5. ✅ **Real-time updates** and statistics
6. ✅ **Role-based access** control
7. ✅ **Complete audit trail** (who, when, why)

**Your purchase request workflow is now complete!** 🚀
