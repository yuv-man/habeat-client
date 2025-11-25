import React from "react";
import { ChevronRight, ChevronLeft, Loader } from "lucide-react";
import { KYCData } from "./types";

interface FitnessStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function FitnessStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
}: FitnessStepProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <button
        onClick={onBack}
        disabled={loading}
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Set Your Fitness Goal
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Help us tailor your plans by letting us know your weekly workout
          frequency.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-green-100 p-6 rounded-full">
              <div className="text-5xl font-bold text-green-500">
                {kycData.workoutFrequency}
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mb-8 font-semibold">
            times/week
          </p>

          <p className="text-center text-gray-700 font-semibold mb-4">
            How many times a week do you plan to work out?
          </p>
          <input
            type="range"
            min="0"
            max="7"
            value={kycData.workoutFrequency}
            onChange={(e) =>
              setKycData((prev) => ({
                ...prev,
                workoutFrequency: parseInt(e.target.value),
              }))
            }
            className="w-full h-3 bg-green-200 rounded-full appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-4">
            <span>0</span>
            <span>7</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            color: "var(--button-primary-text)",
            backgroundColor: "var(--button-primary-bg)",
            boxShadow: "var(--button-shadow-xs)",
          }}
          className="w-full h-12 px-3 flex items-center justify-center gap-2 font-open text-lg font-semibold opacity-50 border-none rounded-xl transition hover:opacity-100 active:opacity-100 disabled:opacity-40"
        >
          {loading ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Next <ChevronRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
