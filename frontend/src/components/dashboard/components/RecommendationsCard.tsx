import React, { useEffect, useState } from "react";
import { Lightbulb, ChevronRight, Sparkles } from "lucide-react";
import axios from "axios";

export default function RecommendationsCard() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/recommendations", {
          userId: "12345",
          healthData: {
            age: 24,
            steps: 5000,
            sleep: "6 hours",
            waterIntake: "1.5L",
          },
        });
        setRecommendations(res.data.recommendations);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Could not load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized for you</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {loading && <p className="text-gray-500 text-sm">Loading recommendations...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading &&
          !error &&
          recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">{recommendation}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          Get More Recommendations
        </button>
      </div>
    </div>
  );
}
