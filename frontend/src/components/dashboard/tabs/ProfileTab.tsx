import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useHealth } from '../../../context/HealthContext';
import { Edit3, Save, Camera, Shield, Smartphone, Globe } from 'lucide-react';
import axios from 'axios';

export default function ProfileTab() {
  const { user } = useAuth();
  const { profile } = useHealth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    language: 'English',
    notifications: true,
    dataSharing: false,
    voiceEnabled: true,
  });

  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    age: profile?.age || 30,
    gender: (profile?.gender as any) || 'other',
    medical_history: (profile?.medicalHistory || []).join(', '),
    lifestyle: (profile as any)?.lifestyle ? JSON.stringify((profile as any).lifestyle) : '',
    risk_factors: [],
  });

  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:8000';

  const handleCreatePatient = async () => {
    const { data } = await axios.post(`${API_BASE}/patients/`, {
      name: patientForm.name,
      age: Number(patientForm.age),
      gender: patientForm.gender,
      medical_history: patientForm.medical_history,
      lifestyle: patientForm.lifestyle,
      risk_factors: patientForm.risk_factors,
    });
    const patientId = data?.data?.patient_id;
    if (patientId) {
      localStorage.setItem('healthapp_patient_id', patientId);
      alert('Patient created');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profile?.age || ''}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profile?.gender || ''}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patient Creation */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Patient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="px-3 py-2 border rounded-lg" placeholder="Name" value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Age" type="number" value={patientForm.age as any} onChange={e => setPatientForm({ ...patientForm, age: Number(e.target.value) as any })} />
              <select className="px-3 py-2 border rounded-lg" value={patientForm.gender} onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input className="px-3 py-2 border rounded-lg" placeholder="Medical history (comma separated)" value={patientForm.medical_history} onChange={e => setPatientForm({ ...patientForm, medical_history: e.target.value })} />
              <input className="px-3 py-2 border rounded-lg md:col-span-2" placeholder="Lifestyle (JSON or text)" value={patientForm.lifestyle} onChange={e => setPatientForm({ ...patientForm, lifestyle: e.target.value })} />
            </div>
            <button onClick={handleCreatePatient} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Save Patient</button>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                <div className="flex flex-wrap gap-2">
                  {profile?.medicalHistory?.map((condition, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                    >
                      {condition}
                    </span>
                  )) || <span className="text-gray-500">No conditions recorded</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {profile?.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                    >
                      {allergy}
                    </span>
                  )) || <span className="text-gray-500">No allergies recorded</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                <div className="flex flex-wrap gap-2">
                  {profile?.medications?.map((medication, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {medication}
                    </span>
                  )) || <span className="text-gray-500">No medications recorded</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Preferences & Settings */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </button>
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Language</span>
                </div>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Data Sharing</span>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.dataSharing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Health Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">85%</div>
              <p className="text-green-100 text-sm">Excellent progress!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}