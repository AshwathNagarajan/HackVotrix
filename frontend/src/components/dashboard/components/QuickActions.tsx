import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Calendar, Camera } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: "Log Symptoms",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Track how you feel",
      path: "/log-symptoms",   // 👈 link to route
    },
    {
      icon: MessageSquare,
      label: "Ask AI",
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Get health advice",
      path: "/",
    },
    {
      icon: Calendar,
      label: "Book Appointment",
      color: "bg-green-500 hover:bg-green-600",
      description: "Schedule with doctor",
      path: "/book-appointment",
    },
    {
      icon: Camera,
      label: "Scan Medication",
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Add to your list",
      path: "/scan-medication",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(action.path)} // 👈 go to route
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
