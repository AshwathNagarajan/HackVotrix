import React, { useRef, useState } from "react";

export default function ScanMedicationPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraOpened, setCameraOpened] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-2xl font-bold">Scan Medication</h1>
          <p className="mt-1 text-gray-200">Scan your medication or enter details manually.</p>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          {!cameraOpened ? (
            <button
              onClick={() => setCameraOpened(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition shadow"
            >
              Open Camera
            </button>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-center gap-4">
                {!isCameraOn ? (
                  <button
                    onClick={() => {
                      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                        if (videoRef.current) videoRef.current.srcObject = stream;
                        setIsCameraOn(true);
                      });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (videoRef.current && videoRef.current.srcObject) {
                        const stream = videoRef.current.srcObject as MediaStream;
                        stream.getTracks().forEach((track) => track.stop());
                        videoRef.current.srcObject = null;
                        setIsCameraOn(false);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Manual Entry</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Medication Name"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Dosage"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Frequency"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            <textarea
              placeholder="Notes"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white py-2 rounded-xl hover:from-green-500 hover:to-blue-600 transition shadow"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
