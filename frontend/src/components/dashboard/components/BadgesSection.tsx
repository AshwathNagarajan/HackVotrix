import React from 'react';
import { useHealth } from '../../../context/HealthContext';
import { Trophy, Star, Calendar } from 'lucide-react';

export default function BadgesSection() {
  const { badges, streaks } = useHealth();
  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Earned Badges */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
          </div>
          <span className="text-sm text-gray-600">{earnedBadges.length} earned</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
            >
              <div className="text-2xl mr-4">{badge.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
                {badge.earnedDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Earned {badge.earnedDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Available Badges */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Next Goals</h4>
          <div className="space-y-3">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="text-lg mr-3 opacity-50">{badge.icon}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-700">{badge.name}</h5>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                </div>
                <Star className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streaks & Stats */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-6 w-6 text-green-200" />
            <span className="text-sm text-green-200">Current</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold mb-1">{streaks.current}</p>
            <p className="text-green-200 text-sm">Day Streak</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Health Stats</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Longest Streak</span>
              <span className="text-sm font-semibold text-gray-900">{streaks.longest} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Badges Earned</span>
              <span className="text-sm font-semibold text-gray-900">{earnedBadges.length}/{badges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-sm font-semibold text-green-600">85%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Risk Level</span>
              <span className="text-sm font-semibold text-green-600">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}