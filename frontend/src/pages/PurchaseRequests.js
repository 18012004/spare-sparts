import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const PurchaseRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.api.get('/api/purchase-requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this purchase request?')) {
      return;
    }

    try {
      await apiService.api.post(`/api/purchase-requests/${requestId}/approve`);
      alert('✅ Purchase request approved successfully!');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Failed to approve request: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectRequest = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      await apiService.api.post(`/api/purchase-requests/${requestId}/reject`, {
        reason: reason.trim()
      });
      alert('❌ Purchase request rejected');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    };
    return icons[status] || '📋';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Requests</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' 
              ? 'Review and manage purchase requests from staff' 
              : 'View your purchase requests'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Export to CSV
              const csvContent = [
                ['Part Name', 'Quantity', 'Status', 'Requested By', 'Date'],
                ...requests.map(r => [
                  r.part_name,
                  r.quantity,
                  r.status,
                  r.requested_by.name,
                  new Date(r.created_at).toLocaleDateString()
                ])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `purchase-requests-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            📥 Export CSV
          </button>
          <button
            onClick={fetchRequests}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏳ Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Approved ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ❌ Rejected ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter !== 'all' ? filter : ''} purchase requests
          </h3>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? 'All requests have been processed' 
              : 'No purchase requests found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{getStatusIcon(request.status)}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.part_name}
                        </h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Quantity:</span> {request.quantity} units
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Requested by:</span> {request.requested_by.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {request.requested_by.email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Role:</span> {request.requested_by.role}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      <p>Created: {new Date(request.created_at).toLocaleString()}</p>
                      {request.approved_at && (
                        <p className="text-green-600">
                          Approved: {new Date(request.approved_at).toLocaleString()}
                          {request.approved_by && ` by ${request.approved_by.name}`}
                        </p>
                      )}
                      {request.rejected_at && (
                        <p className="text-red-600">
                          Rejected: {new Date(request.rejected_at).toLocaleString()}
                          {request.rejected_by && ` by ${request.rejected_by.name}`}
                        </p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-red-600">
                          Reason: {request.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (Admin Only) */}
                  {user?.role === 'admin' && request.status === 'pending' && (
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => approveRequest(request.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium whitespace-nowrap"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium whitespace-nowrap"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Requests</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Rejected</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      {user?.role === 'admin' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Admin Purchase Request Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>As an admin, you can review all purchase requests from staff members.</p>
                <p className="mt-1">Click "Approve" to authorize the purchase or "Reject" to decline with a reason.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;
