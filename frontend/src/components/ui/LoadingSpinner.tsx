import React from 'react';
import { Heart } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="relative">
          <Heart className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">HealthAI</h2>
        <p className="text-gray-600">Loading your personalized health dashboard...</p>
      </div>
    </div>
  );
}