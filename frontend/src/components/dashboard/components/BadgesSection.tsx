import { useHealth } from '../../../context/HealthContext';

export default function BadgesSection() {
  const { badges } = useHealth();
  const earnedBadges = badges.filter(badge => badge.earned);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Removed Achievements section */}

      {/* Badges */}
      <div className="space-y-6">
        {earnedBadges.length > 0 ? (
          earnedBadges.map(badge => (
            <div key={badge.id} className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-500">{badge.description}</p>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">No badges earned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}