import React from 'react';
import { useHealth } from '../../../context/HealthContext';
import MetricsGrid from '../components/MetricsGrid';
import RecommendationsCard from '../components/RecommendationsCard';
import RiskAssessmentCard from '../components/RiskAssessmentCard';
import BadgesSection from '../components/BadgesSection';
import QuickActions from '../components/QuickActions';

export default function OverviewTab() {
  const { metrics, riskAssessment } = useHealth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Good morning, Alex!</h1>
        <p className="text-blue-100 text-lg">
          Your health score has improved by 8% this week. Keep up the great work!
        </p>
        <div className="mt-6 flex items-center space-x-6">
          <div className="text-center">
            <p className="text-2xl font-bold">85%</p>
            <p className="text-blue-200 text-sm">Health Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-blue-200 text-sm">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-blue-200 text-sm">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Metrics Grid */}
      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <RiskAssessmentCard riskAssessment={riskAssessment} />
        
        {/* AI Recommendations */}
        <RecommendationsCard />
      </div>

      {/* Badges Section */}
      <BadgesSection />
    </div>
  );
}