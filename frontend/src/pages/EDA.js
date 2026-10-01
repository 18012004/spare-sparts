import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { Line, Bar } from 'react-chartjs-2';

const EDA = () => {
  const [data, setData] = useState(null);
  const [selectedPart, setSelectedPart] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEDAData();
  }, []);

  const fetchEDAData = async () => {
    try {
      const edaData = await apiService.getEDAData();
      setData(edaData);
      if (edaData.parts && edaData.parts.length > 0) {
        setSelectedPart(edaData.parts[0]);
      }
    } catch (error) {
      console.error('Error fetching EDA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartTrend = async (partName) => {
    try {
      const trendData = await apiService.getPartTrend(partName);
      setData(prev => ({
        ...prev,
        partTrend: trendData
      }));
    } catch (error) {
      console.error('Error fetching part trend:', error);
    }
  };

  useEffect(() => {
    if (selectedPart) {
      fetchPartTrend(selectedPart);
    }
  }, [selectedPart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data || !data.overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Exploratory Data Analysis (EDA)</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Data Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>No data available for analysis. Please upload CSV data on the Upload Data page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Exploratory Data Analysis (EDA)</h1>
      
      {/* Demo Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Demo Mode
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>EDA charts are generated from mock data. In production, this would analyze your actual inventory CSV data.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dataset Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dataset Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.overview.totalRecords}</div>
            <div className="text-sm text-blue-800">Total Records</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.overview.uniqueParts}</div>
            <div className="text-sm text-green-800">Unique Parts</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.overview.dateRange?.months || 0}</div>
            <div className="text-sm text-purple-800">Months of Data</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.overview.avgMonthlyDemand}</div>
            <div className="text-sm text-orange-800">Avg Monthly Demand</div>
          </div>
        </div>
        
        {data.overview.dateRange && (
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Date Range:</strong> {data.overview.dateRange.start} to {data.overview.dateRange.end}</p>
          </div>
        )}
      </div>

      {/* Missing Values */}
      {data.missingValues && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Missing Values</h3>
              <div className="space-y-2">
                {Object.entries(data.missingValues).map(([column, count]) => (
                  <div key={column} className="flex justify-between">
                    <span className="text-sm text-gray-600">{column}:</span>
                    <span className={`text-sm font-medium ${count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {count} ({((count / data.overview.totalRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Date Distribution */}
      {data.dateDistribution && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Date Distribution</h2>
          <div className="h-64">
            <Line
              data={data.dateDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Number of Invoices Over Time'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Invoices'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Top 10 Spare Parts */}
      {data.topParts && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Spare Parts (by frequency)</h2>
          <div className="h-64">
            <Bar
              data={data.topParts}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Most Frequently Ordered Parts'
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Count'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Monthly Demand Trend */}
      {data.monthlyTrend && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Demand Trend (All Parts Combined)</h2>
          <div className="h-64">
            <Line
              data={data.monthlyTrend}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Total Monthly Demand'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Total Demand'
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
      )}

      {/* Part-wise Demand Trend */}
      {data.parts && data.parts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Part-wise Demand Trend</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select part to view its demand
            </label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {data.parts.map((part, index) => (
                <option key={index} value={part}>
                  {part.length > 60 ? part.substring(0, 60) + '...' : part}
                </option>
              ))}
            </select>
          </div>

          {data.partTrend ? (
            <div className="h-64">
              <Line
                data={data.partTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top'
                    },
                    title: {
                      display: true,
                      text: `Demand Trend for Selected Part`
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Demand'
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
          ) : (
            <div className="text-center text-gray-500 py-8">
              Loading part trend data...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EDA;