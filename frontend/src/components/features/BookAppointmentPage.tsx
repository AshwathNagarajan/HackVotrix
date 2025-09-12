import React, { useState } from "react";

export default function BookAppointmentPage() {
  const [details, setDetails] = useState({ doctor: "", date: "", time: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-2xl font-bold">Book Appointment</h1>
          <p className="mt-1 text-gray-200">Schedule with your doctor.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <form className="space-y-4">
            <input
              type="text"
              name="doctor"
              placeholder="Doctor Name"
              value={details.doctor}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="date"
              name="date"
              value={details.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <input
              type="time"
              name="time"
              value={details.time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white py-2 rounded-xl hover:from-green-500 hover:to-blue-600 transition shadow"
            >
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
