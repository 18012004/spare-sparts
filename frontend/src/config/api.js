// API Configuration - Python Backend Only
const API_CONFIG = {
  // Python Backend URL
  BACKEND_URL: 'http://localhost:5001',
  
  // Get the backend URL
  getBaseURL() {
    return this.BACKEND_URL;
  },
  
  // Get endpoint paths
  getEndpoint(type) {
    const endpoints = {
      // Auth endpoints
      'auth.login': '/api/auth/login',
      'auth.signup': '/api/auth/signup',
      'auth.verify': '/api/auth/verify',
      
      // Forecast endpoints
      'forecast.predict': '/predict',
      'forecast.predictWeekly': '/predict-weekly',
      'forecast.predictSingle': '/predict-single',
      'forecast.analyzeTrends': '/analyze-trends',
      
      // Health check
      'health': '/health',
      
      // Model info
      'model.info': '/model-info'
    };
    
    return endpoints[type];
  }
};

export default API_CONFIG;