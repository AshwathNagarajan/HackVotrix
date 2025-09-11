import React from 'react';
import { Plus, MessageSquare, Calendar, Camera, Activity, Heart } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: 'Log Symptoms',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Track how you feel'
    },
    {
      icon: MessageSquare,
      label: 'Ask AI',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Get health advice'
    },
    {
      icon: Calendar,
      label: 'Book Appointment',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Schedule with doctor'
    },
    {
      icon: Camera,
      label: 'Scan Medication',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Add to your list'
    },
    {
      icon: Activity,
      label: 'Log Workout',
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Record exercise'
    },
    {
      icon: Heart,
      label: 'Mood Check',
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Track mental health'
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center p-4 rounded-xl text-white transition-all transform hover:scale-105 ${action.color}`}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium text-center">{action.label}</span>
              <span className="text-xs opacity-80 text-center mt-1">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}