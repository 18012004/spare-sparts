import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseRequests, setPurchaseRequests] = useState(new Set());

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const alertsData = await apiService.getAlerts();
      // Ensure we have an array
      const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
      setAlerts(safeAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const triggerPurchase = async (partName, predictedDemand) => {
    try {
      // Call the new purchase request API
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          part_name: partName,
          quantity: Math.ceil(predictedDemand), // Round up predicted demand
          reason: `High demand alert - Predicted increase of ${predictedDemand.toFixed(1)} units`
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Purchase request sent to admin for approval!');
        setPurchaseRequests(prev => new Set([...prev, partName]));
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to create purchase request'));
      }
    } catch (error) {
      console.error('Error triggering purchase:', error);
      alert('Failed to create purchase request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
      <p className="text-gray-600">Parts predicted to have high demand or potential stock issues</p>
      
      {!alerts || alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                No Alerts
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>No parts are currently showing concerning demand patterns. All systems appear normal.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                High Priority Alerts ({alerts.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {(alerts || []).map((alert, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-3">🚨</span>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {alert.partName.length > 80 
                              ? alert.partName.substring(0, 80) + '...' 
                              : alert.partName
                            }
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Average last 3 months:</span> {alert.avgDemand.toFixed(1)} units
                            </p>
                            <p>
                              <span className="font-medium">Predicted next month:</span> {alert.predictedDemand.toFixed(1)} units
                            </p>
                            <p>
                              <span className="font-medium">Expected increase:</span> 
                              <span className={`ml-1 font-semibold ${
                                alert.increase > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {alert.increase > 0 ? '+' : ''}{alert.increase.toFixed(1)} units
                                ({alert.percentageIncrease > 0 ? '+' : ''}{alert.percentageIncrease.toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {purchaseRequests.has(alert.partName) ? (
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
                          ✓ Purchase Requested
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerPurchase(alert.partName, alert.predictedDemand)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm font-medium"
                        >
                          Request Purchase
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Alert severity indicator */}
                  <div className="mt-3">
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-500 mr-2">Severity:</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.percentageIncrease > 100 
                          ? 'bg-red-100 text-red-800' 
                          : alert.percentageIncrease > 50 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.percentageIncrease > 100 
                          ? 'Critical' 
                          : alert.percentageIncrease > 50 
                          ? 'High' 
                          : 'Medium'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {(alerts || []).filter(a => a.percentageIncrease > 100).length}
                </div>
                <div className="text-sm text-gray-600">Critical Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(alerts || []).filter(a => a.percentageIncrease > 50 && a.percentageIncrease <= 100).length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {(alerts || []).filter(a => a.percentageIncrease <= 50).length}
                </div>
                <div className="text-sm text-gray-600">Medium Priority</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;