import React from "react";

interface CompleteStepProps {
  onComplete: () => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">All Set!</h1>
        <p className="text-gray-600 text-lg mb-10">
          Your profile is complete and personalized plans are ready.
        </p>
        <button
          onClick={onComplete}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-4 rounded-xl transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
