// App.tsx
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthProvider } from './context/HealthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Dashboard & Tabs
import Dashboard from './components/dashboard/Dashboard';
import OverviewTab from './components/dashboard/tabs/OverviewTab';
import AnalyticsTab from './components/dashboard/tabs/AnalyticsTab';
import AskAIPage from './components/dashboard/tabs/ChatbotTab';
import ProfilePage from './components/dashboard/tabs/ProfileTab';
import BookAppointmentPage from './components/features/BookAppointmentPage';

// Other feature pages
import LogSymptomsPage from './components/features/LogSymptomsPage';
import ScanMedicationPage from './components/features/ScanMedicationPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.profileComplete && localStorage.getItem('signup_complete')) {
      setShowOnboarding(true);
      localStorage.removeItem('signup_complete');
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;
  if (showOnboarding) return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;

  return (
    <Routes>
      {/* Dashboard layout for main pages */}
      <Route path="/" element={<Dashboard />}>
        <Route index element={<OverviewTab />} />
        <Route path="analytics" element={<AnalyticsTab />} />
        <Route path="ask-ai" element={<AskAIPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="book-appointment" element={<BookAppointmentPage />} />
      </Route>

      {/* Other feature pages accessible internally */}
      <Route path="log-symptoms" element={<LogSymptomsPage />} />
      <Route path="scan-medication" element={<ScanMedicationPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HealthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <AppContent />
        </div>
      </HealthProvider>
    </AuthProvider>
  );
}

export default App;
