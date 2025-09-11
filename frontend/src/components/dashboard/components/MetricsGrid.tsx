import React from 'react';
import { Activity, Heart, Moon, Droplets, Target, TrendingUp } from 'lucide-react';

interface HealthMetrics {
  steps: number;
  heartRate: number;
  sleep: number;
  calories: number;
  water: number;
  weight: number;
  bloodPressure: { systolic: number; diastolic: number };
}

interface MetricsGridProps {
  metrics: HealthMetrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricCards = [
    {
      label: 'Steps Today',
      value: metrics.steps.toLocaleString(),
      unit: 'steps',
      icon: Activity,
      color: 'blue',
      trend: '+12%',
      target: '10,000',
      progress: (metrics.steps / 10000) * 100,
    },
    {
      label: 'Heart Rate',
      value: metrics.heartRate,
      unit: 'BPM',
      icon: Heart,
      color: 'red',
      trend: 'Normal',
      target: '60-100',
      progress: 75,
    },
    {
      label: 'Sleep Quality',
      value: metrics.sleep,
      unit: 'hours',
      icon: Moon,
      color: 'purple',
      trend: '+0.5h',
      target: '8h',
      progress: (metrics.sleep / 8) * 100,
    },
    {
      label: 'Water Intake',
      value: metrics.water,
      unit: 'glasses',
      icon: Droplets,
      color: 'cyan',
      trend: 'On track',
      target: '8 glasses',
      progress: (metrics.water / 8) * 100,
    },
    {
      label: 'Calories',
      value: metrics.calories.toLocaleString(),
      unit: 'cal',
      icon: Target,
      color: 'orange',
      trend: '-50 cal',
      target: '2000',
      progress: (metrics.calories / 2000) * 100,
    },
    {
      label: 'Blood Pressure',
      value: `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`,
      unit: 'mmHg',
      icon: TrendingUp,
      color: 'green',
      trend: 'Optimal',
      target: '<120/80',
      progress: 85,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      green: 'bg-green-50 text-green-600 border-green-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      cyan: 'bg-cyan-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Today's Metrics</h2>
        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = getColorClasses(metric.color);
          const progressColor = getProgressColor(metric.color);
          
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {metric.trend}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Target: {metric.target}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${Math.min(metric.progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(metric.progress)}% of daily goal
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}