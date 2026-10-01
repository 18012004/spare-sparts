import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParts: 0,
    lastMonthEntries: 0,
    predictedDemand: 0,
    risingParts: []
  });
  const [charts, setCharts] = useState({
    salesTrend: null,
    topParts: null,
    growthTrend: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, chartsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getDashboardCharts()
      ]);
      
      // Ensure risingParts is always an array
      const safeStatsData = {
        totalParts: 0,
        lastMonthEntries: 0,
        predictedDemand: 0,
        risingParts: [],
        ...statsData,
        risingParts: Array.isArray(statsData?.risingParts) ? statsData.risingParts : []
      };
      
      setStats(safeStatsData);
      setCharts(chartsData || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalParts: 0,
        lastMonthEntries: 0,
        predictedDemand: 0,
        risingParts: []
      });
      setCharts({});
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      

      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Unique Parts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalParts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Month Entries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.lastMonthEntries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Predicted Next Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(stats.predictedDemand)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rising Demand Parts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.risingParts?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rising Parts List */}
      {stats.risingParts && stats.risingParts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Rising Parts</h3>
          <div className="space-y-2">
            {(stats.risingParts || []).slice(0, 5).map((part, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate max-w-md">
                  {part.name}
                </span>
                <span className="text-sm font-medium text-green-600">
                  +{(part.growth * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          {charts.salesTrend ? (
            <Line
              data={charts.salesTrend}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Total Demand per Month'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>

        {/* Top Parts */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Spare Parts</h3>
          {charts.topParts ? (
            <Bar
              data={charts.topParts}
              options={{
                responsive: true,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Parts by Frequency'
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Total Demand Growth (Month over Month %)</h3>
        {charts.growthTrend ? (
          <Line
            data={charts.growthTrend}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Growth Rate'
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }}
          />
        ) : (
          <div className="text-center text-gray-500">Not enough data for growth analysis</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;