import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthProvider } from './context/HealthContext';
import LoginPage from './components/auth/LoginPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.profileComplete) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return <Dashboard />;
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