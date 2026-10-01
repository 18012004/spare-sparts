import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import API_CONFIG from '../config/api';
import { useAuth } from '../context/AuthContext';

const BackendStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    isHealthy: null,
    modelLoaded: null,
    lastChecked: null,
    error: null
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const healthData = await apiService.healthCheck();
      setStatus({
        isHealthy: true,
        modelLoaded: healthData.model_loaded,
        scalerLoaded: healthData.scaler_loaded,
        predictorReady: healthData.predictor_ready,
        lastChecked: new Date(),
        error: null
      });
    } catch (error) {
      setStatus({
        isHealthy: false,
        modelLoaded: false,
        lastChecked: new Date(),
        error: error.message
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (status.isHealthy === null) return 'text-gray-400';
    return status.isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isChecking) return '⏳';
    if (status.isHealthy === null) return '❓';
    return status.isHealthy ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (status.isHealthy === null) return 'Unknown';
    if (status.isHealthy) {
      return status.modelLoaded ? 'Healthy (Model Loaded)' : 'Healthy (No Model)';
    }
    return 'Offline';
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Python Backend Status</h3>
        <button
          onClick={checkBackendStatus}
          disabled={isChecking}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Main Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon()}</span>
            <div>
              <div className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <div className="text-sm text-gray-500">
                {API_CONFIG.BACKEND_URL}
              </div>
            </div>
          </div>
          {status.lastChecked && (
            <div className="text-xs text-gray-400">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-xl">👤</span>
              <div>
                <div className="text-sm font-medium text-green-800">
                  Logged in as: {user.name || user.email}
                </div>
                <div className="text-xs text-green-600">
                  Role: {user.role} • Authentication: Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Status */}
        {status.isHealthy && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <span className={status.database_connected ? 'text-green-500' : 'text-red-500'}>
                {status.database_connected ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700">Database</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={status.model_loaded ? 'text-green-500' : 'text-red-500'}>
                {status.model_loaded ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700">LSTM Model</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={status.predictor_ready ? 'text-green-500' : 'text-red-500'}>
                {status.predictor_ready ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700">Predictor</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{status.error}</p>
                  <p className="mt-1">
                    Make sure the Python backend is running: 
                    <code className="ml-1 px-1 bg-red-100 rounded">cd py-backend && python app.py</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {status.isHealthy && (
          <div className="flex space-x-2 text-sm">
            <span className="text-gray-500">Quick Actions:</span>
            <button
              onClick={() => window.open(`${API_CONFIG.BACKEND_URL}/health`, '_blank')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Health
            </button>
            <button
              onClick={() => window.open(`${API_CONFIG.BACKEND_URL}/model-info`, '_blank')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Model Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStatus;