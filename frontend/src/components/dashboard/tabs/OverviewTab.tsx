import { useHealth } from '../../../context/HealthContext';
import RecommendationsCard from '../components/RecommendationsCard';
import RiskAssessmentCard from '../components/RiskAssessmentCard';
import QuickActions from '../components/QuickActions';
import { useState } from 'react';

export default function OverviewTab() {
  const { riskAssessment } = useHealth();
  const [, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Personalized Health Assistant</h1>
        <p className="text-blue-100 text-lg">
          Keep track of Your report analytics in easy and simple way.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <RiskAssessmentCard riskAssessment={riskAssessment} />
        
        {/* AI Recommendations */}
        <RecommendationsCard />
      </div>

    </div>
  );
}