import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/forecast', name: 'Forecast', icon: '📈' },
    { path: '/upload', name: 'Upload Data', icon: '📤', adminOnly: true },
    { path: '/alerts', name: 'Alerts', icon: '🚨' },
    { path: '/purchase-requests', name: 'Purchase Requests', icon: '📋' },
    { path: '/eda', name: 'EDA', icon: '🔍' },
    { path: '/users', name: 'Users', icon: '👥', adminOnly: true }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚙️</span>
          {isOpen && <span className="font-bold text-lg">Spare Parts</span>}
        </div>
      </div>
      
      <nav className="mt-8">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm hover:bg-gray-700 transition-colors ${
              location.pathname === item.path ? 'bg-gray-700 border-r-4 border-blue-500' : ''
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="ml-3">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;