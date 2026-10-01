import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setMessage(result.message);
        }
      } else {
        const result = await signup(email, password, role, name);
        if (result.success) {
          setMessage('Account created successfully! Please login.');
          setTimeout(() => {
            setIsLogin(true);
            setMessage('');
          }, 2000);
        } else {
          setMessage(result.message);
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-2xl">
                ⚙️
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Spare Parts<br />Forecast System
              </h1>
              <p className="text-xl text-indigo-100 leading-relaxed">
                AI-powered inventory forecasting with ARIMA, SARIMA, and Holt-Winters models
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mt-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-indigo-100">Track demand patterns and trends</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold">AI Predictions</h3>
                  <p className="text-sm text-indigo-100">Advanced forecasting algorithms</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold">Smart Alerts</h3>
                  <p className="text-sm text-indigo-100">Proactive inventory management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
              ⚙️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Spare Parts Forecast</h2>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to continue to your dashboard' : 'Sign up to get started'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">📧</span>
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="sample@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Name Input (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">👤</span>
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔒</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-gray-400 text-xl">
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role Selection (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">👔</span>
                    </div>
                    <select
                      className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">▼</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Message */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('success') 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className="text-xl mr-2">
                      {message.includes('success') ? '✅' : '❌'}
                    </span>
                    <p className={`text-sm font-medium ${
                      message.includes('success') ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {message}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isLogin ? '🚀 Sign In' : '✨ Create Account'}
                  </span>
                )}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors duration-200"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
              >
                {isLogin ? (
                  <span>Don't have an account? <span className="underline">Sign up</span></span>
                ) : (
                  <span>Already have an account? <span className="underline">Sign in</span></span>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Spare Parts Forecast. All rights reserved.</p>
            <p className="mt-1">Powered by ARIMA, SARIMA & Holt-Winters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
