import React from "react";
import { ChevronRight, ChevronLeft, Loader } from "lucide-react";
import { KYCData, dietTypes } from "./types";

interface DietStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function DietStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
}: DietStepProps) {
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
          Choose Your Diet Type
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Select the eating plan that best fits your lifestyle and goals.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {dietTypes.map((diet) => {
            return (
              <button
                key={diet.name}
                onClick={() =>
                  setKycData((prev) => ({ ...prev, dietType: diet.name }))
                }
                className={`w-full p-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${
                  kycData.dietType === diet.name
                    ? "border-primary-400 bg-accent"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`${diet.color} p-4 rounded-full flex items-center justify-center`}
                >
                  <div className="w-36 h-36 flex items-center justify-center">
                    {diet.icon}
                  </div>
                </div>
                <div className="font-semibold text-gray-900 text-lg">
                  {diet.name}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !kycData.dietType}
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
