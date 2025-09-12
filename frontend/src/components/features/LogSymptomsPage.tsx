import React, { useState } from "react";

export default function LogSymptomsPage() {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("Mild");
  const [type, setType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { symptoms, duration, severity, type };
    console.log("Saved Symptoms:", data);
    alert("Symptoms saved successfully!");
    setSymptoms("");
    setDuration("");
    setSeverity("Mild");
    setType("");
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-3xl font-bold">Log Your Symptoms</h1>
          <p className="mt-1 text-white/80">Track how you feel today for better health insights.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Symptom description */}
            <textarea
              placeholder="Describe your symptoms..."
              rows={5}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />

            {/* Duration */}
            <input
              type="text"
              placeholder="Duration (e.g., 2 days, 5 hours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />

            {/* Symptom Type */}
            <input
              type="text"
              placeholder="Type of symptom (e.g., Fever, Cough)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />

            {/* Severity */}
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>

            {/* Save button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white py-2 rounded-xl hover:from-green-500 hover:to-blue-600 transition shadow"
            >
              Save Symptoms
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
