import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance for Python backend
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_CONFIG.getBaseURL(),
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to add JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// API service class for Python backend only
class ApiService {
  constructor() {
    this.api = createApiInstance();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get(API_CONFIG.getEndpoint('health'));
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Model information
  async getModelInfo() {
    try {
      const response = await this.api.get(API_CONFIG.getEndpoint('model.info'));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get model info: ${error.message}`);
    }
  }

  // Authentication (real MongoDB-based auth)
  async login(email, password) {
    try {
      const response = await this.api.post('/api/auth/login', {
        email,
        password
      });
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async signup(email, password, role = 'staff') {
    try {
      const response = await this.api.post('/api/auth/signup', {
        email,
        password,
        role
      });
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/api/auth/verify');
      return { user: response.data.user };
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  // Forecast methods
  async runForecast(data) {
    const { part, monthsAhead } = data;
    
    // Generate sample historical data for the part
    const historicalData = this.generateSampleHistoricalData(part, monthsAhead);
    
    const response = await this.api.post(API_CONFIG.getEndpoint('forecast.predict'), {
      historical_data: historicalData,
      prediction_days: monthsAhead * 30 // Convert months to days
    });

    // Convert Python response to frontend format
    return this.convertPythonForecastResponse(response.data, part, monthsAhead);
  }

  async predictWeekly(historicalData, weeksAhead = 4) {
    const response = await this.api.post(API_CONFIG.getEndpoint('forecast.predictWeekly'), {
      historical_data: historicalData,
      weeks_ahead: weeksAhead
    });
    return response.data;
  }

  async predictSingle(historicalData) {
    const response = await this.api.post(API_CONFIG.getEndpoint('forecast.predictSingle'), {
      historical_data: historicalData
    });
    return response.data;
  }

  async analyzeTrends(historicalData) {
    const response = await this.api.post(API_CONFIG.getEndpoint('forecast.analyzeTrends'), {
      historical_data: historicalData
    });
    return response.data;
  }

  // Dashboard methods (mock data)
  async getDashboardStats() {
    return this.getMockDashboardStats();
  }

  async getDashboardCharts() {
    return this.getMockDashboardCharts();
  }

  // Parts methods (mock data)
  async getParts() {
    return this.getSampleParts();
  }

  // Alerts methods (mock data)
  async getAlerts() {
    return this.getMockAlerts();
  }

  async triggerPurchase(partName) {
    // Simulate purchase trigger
    return { success: true, message: 'Purchase order created' };
  }

  // EDA methods (mock data)
  async getEDAData() {
    return this.getMockEDAData();
  }

  async getPartTrend(partName) {
    return this.getMockPartTrend(partName);
  }

  // Helper methods
  generateSampleHistoricalData(part, monthsAhead) {
    // Generate realistic historical data based on part name
    const baseValue = Math.floor(Math.random() * 50) + 20;
    const dataPoints = Math.max(30, monthsAhead * 10); // At least 30 points
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const trend = Math.sin(i * 0.1) * 5; // Seasonal trend
      const noise = (Math.random() - 0.5) * 10; // Random noise
      const value = Math.max(1, baseValue + trend + noise);
      data.push(Math.round(value));
    }
    
    return data;
  }

  convertPythonForecastResponse(pythonResponse, part, monthsAhead) {
    const { predictions } = pythonResponse;
    
    // Generate dates for the forecast
    const startDate = new Date();
    const forecast = predictions.slice(0, monthsAhead).map((value, index) => {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + index + 1);
      return {
        date: date.toISOString(),
        value: Math.round(value * 100) / 100
      };
    });

    // Generate chart data
    const historicalLabels = [];
    const historicalData = [];
    const forecastLabels = [];
    const forecastData = [];

    // Historical data (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      historicalLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      historicalData.push(Math.floor(Math.random() * 30) + 20);
    }

    // Forecast data
    forecast.forEach(item => {
      const date = new Date(item.date);
      forecastLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      forecastData.push(item.value);
    });

    const chartData = {
      labels: [...historicalLabels, ...forecastLabels],
      datasets: [
        {
          label: 'Historical Data',
          data: [...historicalData, ...Array(forecastData.length).fill(null)],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          spanGaps: false
        },
        {
          label: 'Forecast',
          data: [...Array(historicalData.length - 1).fill(null), historicalData[historicalData.length - 1], ...forecastData],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.1,
          spanGaps: false
        }
      ]
    };

    return {
      forecast,
      chartData,
      part,
      monthsAhead,
      model: 'LSTM',
      accuracy: 0.85 + Math.random() * 0.1 // Mock accuracy
    };
  }

  getSampleParts() {
    return [
      'ENGINE OIL',
      'BRAKE PAD',
      'AIR FILTER',
      'SPARK PLUG',
      'BATTERY',
      'TIRE',
      'CLUTCH PLATE',
      'HEADLIGHT BULB',
      'CHAIN SPROCKET',
      'HANDLE BAR',
      'MIRROR',
      'HORN',
      'SPEEDOMETER CABLE',
      'FUEL PUMP',
      'RADIATOR'
    ];
  }

  getMockDashboardStats() {
    return {
      totalParts: 156,
      lastMonthEntries: 2847,
      predictedDemand: 3120,
      risingParts: [
        { name: 'ENGINE OIL', growth: 0.15 },
        { name: 'BRAKE PAD', growth: 0.12 },
        { name: 'AIR FILTER', growth: 0.08 },
        { name: 'SPARK PLUG', growth: 0.06 },
        { name: 'BATTERY', growth: 0.05 }
      ]
    };
  }

  getMockDashboardCharts() {
    return {
      salesTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Demand',
          data: [245, 289, 267, 312, 298, 334],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      topParts: {
        labels: ['ENGINE OIL', 'BRAKE PAD', 'AIR FILTER', 'SPARK PLUG', 'BATTERY'],
        datasets: [{
          label: 'Demand Count',
          data: [89, 76, 65, 54, 48],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ]
        }]
      },
      growthTrend: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Growth Rate',
          data: [18, -7.6, 16.9, -4.5, 12.1],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1
        }]
      }
    };
  }

  getMockAlerts() {
    return [
      {
        _id: '1',
        partName: 'ENGINE OIL',
        avgDemand: 45.2,
        predictedDemand: 67.8,
        increase: 22.6,
        percentageIncrease: 50.0,
        severity: 'high',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        partName: 'BRAKE PAD',
        avgDemand: 32.1,
        predictedDemand: 52.4,
        increase: 20.3,
        percentageIncrease: 63.2,
        severity: 'high',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        partName: 'AIR FILTER',
        avgDemand: 28.5,
        predictedDemand: 71.2,
        increase: 42.7,
        percentageIncrease: 149.8,
        severity: 'critical',
        createdAt: new Date().toISOString()
      },
      {
        _id: '4',
        partName: 'SPARK PLUG',
        avgDemand: 15.8,
        predictedDemand: 23.1,
        increase: 7.3,
        percentageIncrease: 46.2,
        severity: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        _id: '5',
        partName: 'BATTERY',
        avgDemand: 12.4,
        predictedDemand: 38.9,
        increase: 26.5,
        percentageIncrease: 213.7,
        severity: 'critical',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getMockEDAData() {
    const parts = this.getSampleParts();
    
    return {
      parts: parts,
      overview: {
        totalRecords: 15847,
        uniqueParts: parts.length,
        dateRange: {
          start: '2023-01-01',
          end: '2024-12-31',
          months: 24
        },
        avgMonthlyDemand: 1247
      },
      missingValues: {
        'invoice_date': 0,
        'invoice_line_text': 23,
        'vehicle_model': 156,
        'current_km_reading': 89
      },
      dateDistribution: {
        labels: ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'],
        datasets: [{
          label: 'Invoices',
          data: [245, 289, 267, 312, 298, 334, 356, 278, 298, 345, 267, 289],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      topParts: {
        labels: parts.slice(0, 10),
        datasets: [{
          label: 'Frequency',
          data: [892, 756, 654, 543, 487, 423, 389, 345, 298, 267],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      },
      monthlyTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Total Demand',
          data: [1245, 1389, 1267, 1412, 1298, 1534, 1656, 1478, 1598, 1645, 1467, 1589],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1
        }]
      }
    };
  }

  getMockPartTrend(partName) {
    const months = ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023', 'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'];
    
    // Generate realistic trend data based on part name
    const baseValue = partName.includes('ENGINE') ? 80 : 
                     partName.includes('BRAKE') ? 60 : 
                     partName.includes('BATTERY') ? 40 : 30;
    
    const data = months.map((_, index) => {
      const seasonal = Math.sin((index / 12) * 2 * Math.PI) * 10;
      const trend = index * 2; // Slight upward trend
      const noise = (Math.random() - 0.5) * 15;
      return Math.max(5, Math.round(baseValue + seasonal + trend + noise));
    });
    
    return {
      labels: months,
      datasets: [{
        label: partName.length > 30 ? partName.substring(0, 30) + '...' : partName,
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }]
    };
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;