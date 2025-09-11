import React, { useState } from 'react';
import { TrendingUp, Calendar, Target, Activity, Upload } from 'lucide-react';
import HealthChart from '../components/HealthChart';
import RiskHeatmap from '../components/RiskHeatmap';
import axios from 'axios';

export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState('7d');
  const [uploading, setUploading] = useState(false);

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' },
  ];

  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:8000';
  const patientId = typeof window !== 'undefined' ? localStorage.getItem('healthapp_patient_id') : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('patient_id', patientId);
      form.append('file', file);
      await axios.post(`${API_BASE}/reports/upload`, form);
      alert('Report uploaded');
    } catch (e: any) {
      alert(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Analytics</h1>
          <p className="text-gray-600">Detailed insights into your health trends and patterns</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <label className="ml-3 inline-flex items-center px-3 py-2 border rounded-lg text-sm cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Report'}
            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Steps</p>
              <p className="text-2xl font-bold text-gray-900">8,234</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs last week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sleep Quality</p>
              <p className="text-2xl font-bold text-gray-900">7.5h</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.5h vs last week
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Heart Rate</p>
              <p className="text-2xl font-bold text-gray-900">72 BPM</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Stable
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart
          title="Activity Trends"
          type="steps"
          timeRange={timeRange}
        />
        <HealthChart
          title="Sleep Patterns"
          type="sleep"
          timeRange={timeRange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart
          title="Heart Rate Variability"
          type="heartRate"
          timeRange={timeRange}
        />
        <RiskHeatmap />
      </div>
    </div>
  );
}