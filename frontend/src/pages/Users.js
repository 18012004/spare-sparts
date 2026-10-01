import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      // This endpoint would need to be implemented in the backend
      const response = await apiService.api.get('/api/auth/users');
      console.log('Users response:', response.data);
      
      if (response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setError('');
      } else {
        setError('Invalid response format from server');
        console.error('Invalid response:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Admin Access Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>User management is only available to admin users.</p>
                <p className="mt-1">Current user: <strong>{user?.email}</strong> (Role: {user?.role})</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={fetchUsers}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium mb-2">Error: {error}</div>
          <div className="text-sm text-red-600">
            <p>Troubleshooting steps:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>Check if backend is running (http://localhost:5001)</li>
              <li>Check if MongoDB is connected</li>
              <li>Check browser console for detailed errors</li>
              <li>Verify you're logged in as admin</li>
            </ul>
          </div>
          <button
            onClick={async () => {
              try {
                const response = await apiService.api.get('/api/test-db');
                alert('Database Status: ' + JSON.stringify(response.data, null, 2));
              } catch (err) {
                alert('Database test failed: ' + err.message);
              }
            }}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Test Database Connection
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Registered Users ({users.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userData) => (
                <tr key={userData.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {userData.name?.charAt(0).toUpperCase() || userData.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userData.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {userData.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userData.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userData.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userData.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              User Management
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>This page shows all registered users in the system. New users can register through the login page.</p>
              <p className="mt-1">To create additional admin users, use the signup form and select "Admin" role.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;