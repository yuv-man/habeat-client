import React from "react";
import { ChevronRight, ChevronLeft, Loader, Calculator } from "lucide-react";
import { KYCData } from "./types";
import {
  calculateBMR,
  calculateTDEE,
  calculateIdealWeight,
} from "@/lib/calculations";

interface HealthProfileStepProps {
  kycData: KYCData;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function HealthProfileStep({
  kycData,
  loading,
  error,
  onSubmit,
  onBack,
}: HealthProfileStepProps) {
  const userDataForCalc = {
    weight: parseFloat(kycData.weight) || 0,
    height: parseFloat(kycData.height) || 0,
    age: parseFloat(kycData.age) || 0,
    gender: kycData.gender || "male",
  };

  const bmr = calculateBMR(userDataForCalc);
  const tdee = calculateTDEE(bmr);
  const idealWeight = calculateIdealWeight(userDataForCalc);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex items-center justify-center p-4 relative min-h-screen">
        <button
          onClick={onBack}
          disabled={loading}
          className="absolute top-4 left-4 p-2 rounded-full transition disabled:opacity-50 z-10"
          style={{
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-100)";
            e.currentTarget.style.color = "var(--primary-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Your Health Profile
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Based on your information, here are your personalized metrics
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div
              className="p-6 rounded-2xl text-white shadow-lg transform transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium opacity-95">
                  Basal Metabolic Rate
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">
                {Math.round(bmr)}{" "}
                <span className="text-sm opacity-90">kcal/day</span>
              </div>
              <div className="text-xs opacity-80 mt-2">
                Calories your body burns at rest
              </div>
            </div>

            <div
              className="p-6 rounded-2xl text-white shadow-lg transform transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium opacity-95">
                  Total Daily Energy Expenditure
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">
                {Math.round(tdee)}{" "}
                <span className="text-sm opacity-90">kcal/day</span>
              </div>
              <div className="text-xs opacity-80 mt-2">
                Total calories you burn per day
              </div>
            </div>

            <div
              className="p-6 rounded-2xl text-white shadow-lg transform transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium opacity-95">
                  Ideal Weight Range
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">
                {Math.round(idealWeight)}{" "}
                <span className="text-sm opacity-90">kg</span>
              </div>
              <div className="text-xs opacity-80 mt-2">
                Recommended weight for your height
              </div>
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
            className="w-full h-12 px-3 flex items-center justify-center gap-2 font-open text-lg font-semibold border-none rounded-xl transition hover:opacity-100 active:opacity-100 disabled:opacity-40"
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Complete Registration <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
