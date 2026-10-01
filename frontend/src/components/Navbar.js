import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 mr-4"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Spare Parts Forecast</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              user?.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;