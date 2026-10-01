# Debug Checklist for Dashboard Errors

## Current Issue
Dashboard showing "Cannot read properties of undefined (reading 'length')" errors.

## Quick Fixes Applied

### 1. Fixed Mock Data Structure ✅
- Updated `getMockDashboardStats()` to include `risingParts` array
- Updated `getMockDashboardCharts()` to include `salesTrend` and `growthTrend`
- Added proper data structure matching Dashboard expectations

### 2. Added Null Safety ✅
- Added `?.` optional chaining for `risingParts.length`
- Added array checks before mapping
- Added default empty arrays in state initialization

### 3. Added Debug Logging ✅
- Added console.log statements to track data flow
- Added error handling with default values

## Testing Steps

### 1. Check Browser Console
Open Developer Tools (F12) and look for:
```
Fetching dashboard data...
getDashboardStats called, USE_PYTHON_BACKEND: true
Returning mock dashboard stats: {...}
Stats data received: {...}
```

### 2. Verify Backend Status
```bash
# Test if Python backend is running
curl http://localhost:5001/health

# Expected response:
# {"status":"healthy","model_loaded":true,"scaler_loaded":true,"predictor_ready":true}
```

### 3. Check Frontend Configuration
In browser console, run:
```javascript
// Check API config
console.log(window.API_CONFIG || 'API_CONFIG not available');

// Check if using Python backend
import('./src/config/api.js').then(config => console.log('USE_PYTHON_BACKEND:', config.default.USE_PYTHON_BACKEND));
```

## Expected Data Structure

### Dashboard Stats:
```javascript
{
  totalParts: 156,
  lastMonthEntries: 2847,
  predictedDemand: 3120,
  risingParts: [
    { name: 'ENGINE OIL', growth: 0.15 },
    { name: 'BRAKE PAD', growth: 0.12 }
  ]
}
```

### Dashboard Charts:
```javascript
{
  salesTrend: { labels: [...], datasets: [...] },
  topParts: { labels: [...], datasets: [...] },
  growthTrend: { labels: [...], datasets: [...] }
}
```

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
**Cause**: Data not loaded or wrong structure
**Solution**: Check console logs, verify mock data structure

### Issue: Charts not displaying
**Cause**: Chart.js not properly registered or data format wrong
**Solution**: Verify Chart.js imports and data structure

### Issue: Backend connection errors
**Cause**: Python backend not running or wrong port
**Solution**: Start Python backend: `cd py-backend && python app.py`

## Manual Test

1. **Start Python Backend**:
   ```bash
   cd py-backend
   python app.py
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Open Browser**: `http://localhost:3000`

4. **Login**: Use any email/password (simulated for Python backend)

5. **Check Dashboard**: Should load without errors

## If Still Having Issues

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Network Tab**: Look for failed API calls
3. **Restart Frontend**: Stop (Ctrl+C) and restart `npm start`
4. **Check Console**: Look for JavaScript errors

## Success Indicators

✅ No red errors in browser console  
✅ Dashboard loads with stats cards  
✅ Backend Switcher shows "Python (LSTM Model)"  
✅ Charts display properly  
✅ Rising parts list shows sample data  

## Next Steps After Fix

1. Remove debug console.log statements
2. Test forecast functionality
3. Verify backend switching works
4. Test with real model predictions