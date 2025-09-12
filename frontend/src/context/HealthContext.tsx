import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface HealthMetrics {
  steps: number;
  heartRate: number;
  sleep: number;
  calories: number;
  water: number;
  weight: number;
  bloodPressure: { systolic: number; diastolic: number };
}

interface RiskAssessment {
  cardiovascular: number;
  diabetes: number;
  hypertension: number;
  overall: number;
}

interface UserProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  lifestyle: {
    smokingStatus: string;
    alcoholConsumption: string;
    exerciseFrequency: string;
    stressLevel: number;
  };
  familyHistory: string[];
}

interface HealthContextType {
  profile: UserProfile | null;
  metrics: HealthMetrics;
  riskAssessment: RiskAssessment;
  updateProfile: (profile: UserProfile) => void;
  updateMetrics: (metrics: Partial<HealthMetrics>) => void;
  getRecommendations: () => string[];
  badges: Badge[];
  fetchRiskHeatmap: (patientId: string) => Promise<{ url?: string; base64?: string } | null>;
  fetchReports: (patientId: string) => Promise<any[]>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export function HealthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    steps: 8234,
    heartRate: 72,
    sleep: 7.5,
    calories: 1850,
    water: 6,
    weight: 70,
    bloodPressure: { systolic: 120, diastolic: 80 },
  });
  
  const [riskAssessment] = useState<RiskAssessment>({
    cardiovascular: 15,
    diabetes: 12,
    hypertension: 18,
    overall: 20,
  });

  const [badges] = useState<Badge[]>([
    {
      id: '1',
      name: 'Early Bird',
      description: 'Completed morning routine 7 days in a row',
      icon: '🌅',
      earned: true,
      earnedDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Hydration Hero',
      description: 'Reached daily water goal for 30 days',
      icon: '💧',
      earned: true,
      earnedDate: new Date('2024-01-20'),
    },
    {
      id: '3',
      name: 'Step Master',
      description: 'Walked 10,000 steps daily for 2 weeks',
      icon: '👟',
      earned: false,
    },
    {
      id: '4',
      name: 'Heart Healthy',
      description: 'Maintained target heart rate during workouts',
      icon: '❤️',
      earned: true,
      earnedDate: new Date('2024-01-25'),
    },
  ]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('healthapp_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    const storedMetrics = localStorage.getItem('healthapp_health_data');
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('healthapp_profile', JSON.stringify(newProfile));
  };

  const updateMetrics = (newMetrics: Partial<HealthMetrics>) => {
    const updated = { ...metrics, ...newMetrics };
    setMetrics(updated);
    localStorage.setItem('healthapp_health_data', JSON.stringify(updated));
  };

  const getRecommendations = (): string[] => {
    const recommendations = [
      'Increase daily water intake to 8-10 glasses for better hydration',
      'Consider a 10-minute meditation session to reduce stress levels',
      'Add more leafy greens to your diet for cardiovascular health',
      'Schedule a 30-minute walk after dinner to improve digestion',
      'Ensure 7-9 hours of quality sleep for optimal recovery',
    ];

    if (profile) {
      if (metrics.steps < 8000) {
        recommendations.unshift('Your step count is below target. Try taking the stairs or parking further away.');
      }
      if (metrics.sleep < 7) {
        recommendations.unshift('Consider establishing a consistent bedtime routine for better sleep quality.');
      }
      if ((profile as any).lifestyle?.stressLevel > 7) {
        recommendations.unshift('High stress detected. Practice deep breathing exercises or try yoga.');
      }
    }

    return recommendations.slice(0, 5);
  };

  const fetchRiskHeatmap = async (patientId: string) => {
    try {
      const { data } = await axios.get(`${API_BASE}/ai/risk-heatmap/${patientId}`);
      return data?.data?.heatmap || null;
    } catch (e) {
      return null;
    }
  };

  const fetchReports = async (patientId: string) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/by-patient/${patientId}`);
      return data?.data || [];
    } catch (e) {
      return [];
    }
  };

  return (
    <HealthContext.Provider value={{
      profile,
      metrics,
      riskAssessment,
      updateProfile,
      updateMetrics,
      getRecommendations,
      badges,
      fetchRiskHeatmap,
      fetchReports,
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}