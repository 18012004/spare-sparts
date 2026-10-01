import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Upload from './pages/Upload';
import Alerts from './pages/Alerts';
import EDA from './pages/EDA';
import Users from './pages/Users';
import PurchaseRequests from './pages/PurchaseRequests';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/eda" element={<EDA />} />
            <Route path="/users" element={<Users />} />
            <Route path="/purchase-requests" element={<PurchaseRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;