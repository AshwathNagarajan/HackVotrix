import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Upload, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../ui/LoadingSpinner';

// Setup logging
const logger = {
  error: (message: string, error: any) => {
    console.error(message, error);
  }
};

// AI Suggestion Component
// Health Metric Details Component with Effects and Prevention
const HealthMetricDetails: React.FC<{ 
  concern: string;
  fetchAISuggestion: (concern: string) => Promise<string | null>;
}> = ({ concern, fetchAISuggestion }) => {
  const [suggestions, setSuggestions] = useState<{
    effects: string | null;
    prevention: string | null;
    recommendations: string | null;
  }>({
    effects: null,
    prevention: null,
    recommendations: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get effects
        const effectsPrompt = `What are the potential health effects and risks of this condition: "${concern}"? Provide a concise, bullet-point response focusing on the most important effects.`;
        const effects = await fetchAISuggestion(effectsPrompt);
        
        // Get prevention strategies
        const preventionPrompt = `What are the most effective ways to prevent or manage this health concern: "${concern}"? Provide specific, actionable steps.`;
        const prevention = await fetchAISuggestion(preventionPrompt);
        
        // Get personalized recommendations
        const recsPrompt = `Based on this health concern: "${concern}", what are the top 3-4 immediate actions to take to improve this condition? Include both lifestyle changes and medical considerations.`;
        const recommendations = await fetchAISuggestion(recsPrompt);
        
        setSuggestions({
          effects,
          prevention,
          recommendations
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to get health insights');
        logger.error('Health insights error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      getDetails();
    }
  }, [concern, user?.id, fetchAISuggestion]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <LoadingSpinner className="w-6 h-6" minimal />
        <span className="ml-3 text-gray-600">Analyzing health metrics...</span>
      </div>
    );
  }

  if (error || (!suggestions.effects && !suggestions.prevention && !suggestions.recommendations)) {
    return (
      <div className="text-gray-500 text-center py-4">
        Unable to load health insights at this time.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Potential Effects */}
      {suggestions.effects && (
        <div className="space-y-2">
          <h5 className="text-red-800 font-medium flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Potential Health Effects
          </h5>
          <div className="text-gray-700 text-sm pl-6">
            {suggestions.effects}
          </div>
        </div>
      )}

      {/* Prevention Strategies */}
      {suggestions.prevention && (
        <div className="space-y-2">
          <h5 className="text-green-800 font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Prevention & Management
          </h5>
          <div className="text-gray-700 text-sm pl-6 bg-green-50 p-3 rounded-md">
            {suggestions.prevention}
          </div>
        </div>
      )}

      {/* Action Steps */}
      {suggestions.recommendations && (
        <div className="space-y-2">
          <h5 className="text-blue-800 font-medium flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Recommended Action Steps
          </h5>
          <div className="text-gray-700 text-sm pl-6 bg-blue-50 p-3 rounded-md border border-blue-100">
            {suggestions.recommendations}
          </div>
        </div>
      )}
    </div>
  );
};

interface LabRecord {
  date: string;
  test_type: string;
  findings: string;
}

interface Analysis {
  pros: string[];
  cons: string[];
  lab_records: LabRecord[];
}

export default function AnalyticsTab() {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});

  const { user } = useAuth();
  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';
  const patientId = user?.id;

  const fetchAISuggestion = async (concern: string) => {
    try {
      const response = await axios.post(`${API_BASE}/ai/chat/${patientId}`, {
        message: `Please provide specific recommendations to address this health concern: ${concern}`,
        history: []
      });
      
      if (response.data?.success && response.data?.data?.reply) {
        return response.data.data.reply;
      } else if (response.data?.error) {
        logger.error('AI suggestion error:', response.data.error);
        return 'Unable to generate recommendations at this time. Please consult your healthcare provider.';
      } else {
        return 'No specific recommendations available. Please consult your healthcare provider.';
      }
    } catch (err: any) {
      logger.error('AI suggestion error:', err);
      return 'An error occurred while fetching recommendations. Please try again later.';
    }
  };

  const fetchAnalysis = useCallback(async () => {
    if (!patientId) {
      setLoadingAnalysis(false);
      return;
    }
    setLoadingAnalysis(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/reports/analyze/${patientId}`);
      if (response.data && response.data.data) {
        setAnalysis(response.data.data);
      } else {
        setAnalysis(null); // No analysis found
      }
    } catch (e: any) {
      if (e.response && e.response.status === 404) {
        setAnalysis(null); // It's not an error if no report exists yet
      } else {
        setError(e?.message || 'Failed to fetch analysis');
      }
    } finally {
      setLoadingAnalysis(false);
    }
  }, [patientId, API_BASE]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId) {
      return;
    }
    
    setUploading(true);
    setError(null);
    setAnalysis(null);

    try {
      const form = new FormData();
      form.append('file', file);
      
      await axios.post(`${API_BASE}/reports/upload/${patientId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // After successful upload, re-fetch the analysis
      await fetchAnalysis();

    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || e?.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const toggleExpand = (index: number) => {
    setIsExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderContent = () => {
    if (loadingAnalysis || uploading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-lg">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {uploading ? "Processing your report..." : "Loading your health analysis..."}
          </p>
          <p className="text-gray-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-700">An Error Occurred</p>
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">No Analysis Available</h3>
          <p className="mt-1 text-gray-500">Upload a health report to get started.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 flex items-center mb-3">
              <CheckCircle className="h-6 w-6 mr-2" />
              Positive Indicators
            </h3>
            <ul className="space-y-2 list-inside list-disc text-green-700">
              {(analysis?.pros ?? []).map((pro: string, index: number) => (
                <li key={index}>{pro}</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-red-800 flex items-center mb-3">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Areas for Attention
            </h3>
            <div className="space-y-6">
              {(analysis?.cons ?? []).map((con: string, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-red-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-red-50 p-4 border-b border-red-100">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-lg font-semibold text-red-800">{con}</h4>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <HealthMetricDetails concern={con} fetchAISuggestion={fetchAISuggestion} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Records */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Lab Records</h2>
          {analysis.lab_records.length > 0 ? (
            <ul className="space-y-3">
              {analysis.lab_records.map((record: LabRecord, index: number) => (
                <li key={index} className="border border-gray-200 bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <div className="font-semibold text-gray-800">
                      {record.test_type || 'General Record'} - <span className="font-normal text-gray-600">{record.date || 'Unknown Date'}</span>
                    </div>
                    {isExpanded[index] ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                  </button>
                  {isExpanded[index] && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-gray-700 whitespace-pre-wrap">{record.findings || 'No specific findings detailed.'}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific lab records were extracted from the report.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
          <p className="text-gray-600 mt-1">AI-powered insights from your health reports.</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1.5" />
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <label className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${uploading ? 'bg-gray-400 cursor-not-allowed' : ''}`}>
            <Upload className="h-5 w-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload New Report'}
            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}
    </div>
  );
}