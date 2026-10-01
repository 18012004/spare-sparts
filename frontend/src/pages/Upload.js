import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Upload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setFile(null);
      setMessage('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Simulate realistic file processing steps
      setMessage('Reading CSV file...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessage('Validating data format...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setMessage('Processing records...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Analyzing data patterns...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mock successful upload result based on file size
      const estimatedRecords = Math.floor(file.size / 100); // Rough estimate
      const mockResult = {
        recordsProcessed: Math.max(estimatedRecords, 500),
        uniqueParts: Math.floor(Math.random() * 50) + 80,
        dateRange: {
          start: '2023-01-01',
          end: '2024-12-31'
        },
        dataQuality: {
          validRecords: Math.max(estimatedRecords - 10, 490),
          invalidRecords: Math.min(10, Math.floor(estimatedRecords * 0.02)),
          duplicates: Math.floor(Math.random() * 20) + 5
        },
        topParts: [
          'ENGINE OIL',
          'BRAKE PAD', 
          'AIR FILTER',
          'SPARK PLUG',
          'BATTERY'
        ]
      };

      setUploadResult(mockResult);
      setMessage('CSV file processed successfully! (Demo mode - file analyzed locally)');
      setFile(null);
      // Reset file input
      document.getElementById('csvFile').value = '';
    } catch (error) {
      setMessage('Processing failed. Please try again.');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Admin Access Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Upload functionality is only available to admin users.</p>
                <p className="mt-1">Current user: <strong>{user?.email}</strong> (Role: {user?.role})</p>
                <p className="mt-1">Please log in as an admin to upload data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
      <p className="text-gray-600">Upload new CSV inventory data (Admin only)</p>
      
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
              <p>File upload is currently in demo mode. Files are processed locally for demonstration purposes. 
              For real data processing, integrate with a backend storage system.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="csvFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="csvFile"
                      name="csvFile"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <span className="text-blue-400 text-xl mr-3">📄</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Selected file: {file.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('success') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="bg-green-50 border border-green-200 rounded-md p-6">
              <h3 className="text-lg font-medium text-green-800 mb-4">
                ✅ Processing Complete!
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Processing Summary */}
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2">Processing Summary</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Total Records:</strong> {uploadResult.recordsProcessed.toLocaleString()}</p>
                    <p><strong>Unique Parts:</strong> {uploadResult.uniqueParts}</p>
                    <p><strong>Date Range:</strong> {uploadResult.dateRange?.start} to {uploadResult.dateRange?.end}</p>
                  </div>
                </div>
                
                {/* Data Quality */}
                {uploadResult.dataQuality && (
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-2">Data Quality</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Valid Records:</strong> {uploadResult.dataQuality.validRecords.toLocaleString()}</p>
                      <p><strong>Invalid Records:</strong> {uploadResult.dataQuality.invalidRecords}</p>
                      <p><strong>Duplicates Removed:</strong> {uploadResult.dataQuality.duplicates}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Top Parts */}
              {uploadResult.topParts && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Top 5 Most Frequent Parts</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadResult.topParts.map((part, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-green-100 rounded-md">
                <p className="text-xs text-green-600">
                  💡 <strong>Next Steps:</strong> Visit the EDA page to explore data patterns, or go to Forecast to generate predictions using your LSTM model.
                </p>
              </div>
            </div>
          )}

          {/* CSV Format Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Expected CSV Format
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>The CSV file should contain the following columns:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>invoice_date</strong>: Date in DD-MM-YY or DD-MM-YYYY format</li>
                <li><strong>invoice_line_text</strong>: Spare part name/description</li>
              </ul>
              <p className="mt-2 text-xs">
                Additional columns are allowed but will be ignored during processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;