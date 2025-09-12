import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import axios from 'axios';

export default function RiskHeatmap() {
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientId = typeof window !== 'undefined' ? localStorage.getItem('healthapp_patient_id') : null;

  useEffect(() => {
    const fetchHeatmap = async () => {
      if (!patientId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patients/${patientId}/heatmap`);
        if (data?.url) setHeatmapUrl(data.url);
        else if (data?.base64) setHeatmapUrl(`data:image/png;base64,${data.base64}`);
      } catch (e) {
        setError('Failed to load heatmap');
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">Loading heatmap...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (heatmapUrl) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Heatmap</h3>
            <p className="text-sm text-gray-600">AI-generated risk analysis</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Info className="h-4 w-4" />
          </button>
        </div>
        <img src={heatmapUrl} alt="Risk heatmap" className="w-full rounded-lg border" />
      </div>
    );
  }

  return null;
}