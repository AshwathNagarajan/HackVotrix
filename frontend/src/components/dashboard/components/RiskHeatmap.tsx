import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useHealth } from '../../../context/HealthContext';

export default function RiskHeatmap() {
  const { fetchRiskHeatmap } = useHealth();
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientId = typeof window !== 'undefined' ? localStorage.getItem('healthapp_patient_id') : null;

  useEffect(() => {
    const run = async () => {
      if (!patientId) return;
      try {
        setLoading(true);
        const img = await fetchRiskHeatmap(patientId);
        if (img?.url) setHeatmapUrl(img.url);
        else if (img?.base64) setHeatmapUrl(`data:image/png;base64,${img.base64}`);
      } catch (e) {
        setError('Failed to load heatmap');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">Loading heatmap...</div>
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

  // Fallback static UI
  const riskFactors = [
    { category: 'Cardiovascular', subcategories: [
      { name: 'Blood Pressure', risk: 'low', value: 15 },
      { name: 'Cholesterol', risk: 'moderate', value: 35 },
      { name: 'Family History', risk: 'moderate', value: 40 },
      { name: 'Exercise Level', risk: 'low', value: 10 },
    ]},
    { category: 'Metabolic', subcategories: [
      { name: 'Blood Sugar', risk: 'low', value: 12 },
      { name: 'BMI', risk: 'low', value: 18 },
      { name: 'Diet Quality', risk: 'moderate', value: 25 },
      { name: 'Sleep Quality', risk: 'low', value: 8 },
    ]},
    { category: 'Lifestyle', subcategories: [
      { name: 'Stress Level', risk: 'moderate', value: 30 },
      { name: 'Smoking', risk: 'low', value: 0 },
      { name: 'Alcohol', risk: 'low', value: 5 },
      { name: 'Physical Activity', risk: 'low', value: 15 },
    ]},
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-3 w-3" />;
      case 'moderate': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <AlertCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Heatmap</h3>
          <p className="text-sm text-gray-600">Comprehensive health risk analysis</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Info className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="space-y-6">
        {riskFactors.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{category.category}</h4>
            <div className="grid grid-cols-1 gap-2">
              {category.subcategories.map((subcategory, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getRiskColor(subcategory.risk)}`}
                >
                  <div className="flex items-center">
                    {getRiskIcon(subcategory.risk)}
                    <span className="text-sm font-medium ml-2">{subcategory.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-white/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          subcategory.risk === 'low' ? 'bg-green-500' :
                          subcategory.risk === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subcategory.value}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{subcategory.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Low Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">High Risk</span>
            </div>
          </div>
          <span className="text-gray-500">Updated daily</span>
        </div>
      </div>
    </div>
  );
}