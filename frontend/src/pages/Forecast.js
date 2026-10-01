import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { Line } from 'react-chartjs-2';

const Forecast = () => {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [monthsAhead, setMonthsAhead] = useState(1);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [partsLoading, setPartsLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const parts = await apiService.getParts();
      setParts(parts);
      if (parts.length > 0) {
        setSelectedPart(parts[0]);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setPartsLoading(false);
    }
  };

  const runForecast = async () => {
    if (!selectedPart) return;
    
    setLoading(true);
    try {
      const response = await apiService.runForecast({
        part: selectedPart,
        monthsAhead: monthsAhead
      });
      setForecastData(response);
    } catch (error) {
      console.error('Error running forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!forecastData || !forecastData.forecast) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Forecast\n"
      + forecastData.forecast.map(item => `${item.date},${item.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedPart.substring(0, 30)}_forecast.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (partsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Forecast</h1>
      <p className="text-gray-600">Predict sales for a spare part</p>

      {parts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No data loaded
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Upload CSV data on the Upload Data page to start forecasting.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Spare Part
                </label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {parts.map((part, index) => (
                    <option key={index} value={part}>
                      {part.length > 50 ? part.substring(0, 50) + '...' : part}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Months to Forecast
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={monthsAhead}
                  onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={runForecast}
                  disabled={loading || !selectedPart}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Running...' : 'Run Forecast'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {forecastData && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Forecast for: {selectedPart.length > 60 ? selectedPart.substring(0, 60) + '...' : selectedPart}
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={downloadCSV}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
                
                {/* Chart */}
                <div className="h-96">
                  <Line
                    data={forecastData.chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Historical Data vs Forecast'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Demand (count)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Month'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Forecast Table */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Predicted Demand
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forecastData.forecast.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(item.value * 100) / 100}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Forecast;