import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  profileComplete: boolean;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Updated default API_BASE to use localhost
const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add axios response interceptor for handling token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const token = localStorage.getItem('healthapp_token');
            if (token) {
              const response = await axios.post(`${API_BASE}/auth/refresh`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (response.data.access_token) {
                localStorage.setItem('healthapp_token', response.data.access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                
                // Retry the original request with the new token
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            // If refresh fails, log out
            logout();
            throw error;
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('healthapp_user');
    const token = localStorage.getItem('healthapp_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);
      const { data } = await axios.post(`${API_BASE}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token: string = data.access_token;
      localStorage.setItem('healthapp_token', token);
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Decode token to get user ID
      let userId = '';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) {
          userId = payload.sub;
        }
      } catch (e) {
        console.error('Failed to decode token', e);
      }

      // This is the critical fix: store the actual patient ID
      if (userId) {
        localStorage.setItem('healthapp_patient_id', userId);
      }

      const newUser: User = {
        id: userId,
        email,
        name: email.split('@')[0],
        profileComplete: data.profileComplete,
        createdAt: new Date(),
      };
      setUser(newUser);
      localStorage.setItem('healthapp_user', JSON.stringify(newUser));
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    await axios.post(`${API_BASE}/auth/signup`, { email, password });
    await login(email, password);
    updateProfile({ name });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthapp_user');
    localStorage.removeItem('healthapp_profile');
    localStorage.removeItem('healthapp_health_data');
    localStorage.removeItem('healthapp_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('healthapp_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}