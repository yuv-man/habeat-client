import React from "react";
import { ChevronRight, ChevronLeft, Loader } from "lucide-react";
import { KYCData } from "./types";

interface ProfileStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ProfileStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
}: ProfileStepProps) {
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
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Your Health Profile
          </h1>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Help us personalize your plans by telling us a bit about yourself.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6 mb-8">
            <div>
              <label
                className="block text-base font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kycData.weight}
                  onChange={(e) =>
                    setKycData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="w-full px-4 py-3 pr-12 rounded-xl text-center text-lg transition-all"
                  style={{
                    border: "2px solid var(--border-light)",
                    backgroundColor: "white",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-500)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px var(--primary-100)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  kg
                </div>
              </div>
            </div>
            <div>
              <label
                className="block text-base font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Height
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kycData.height}
                  onChange={(e) =>
                    setKycData((prev) => ({ ...prev, height: e.target.value }))
                  }
                  className="w-full px-4 py-3 pr-12 rounded-xl text-center text-lg transition-all"
                  style={{
                    border: "2px solid var(--border-light)",
                    backgroundColor: "white",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-500)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px var(--primary-100)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  cm
                </div>
              </div>
            </div>
            <div>
              <label
                className="block text-base font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Age
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kycData.age}
                  onChange={(e) =>
                    setKycData((prev) => ({ ...prev, age: e.target.value }))
                  }
                  className="w-full px-4 py-3 pr-16 rounded-xl text-center text-lg transition-all"
                  style={{
                    border: "2px solid var(--border-light)",
                    backgroundColor: "white",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-500)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px var(--primary-100)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  years
                </div>
              </div>
            </div>
            <div>
              <label
                className="block text-base font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Gender
              </label>
              <select
                value={kycData.gender}
                onChange={(e) =>
                  setKycData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl text-base transition-all"
                style={{
                  border: "2px solid var(--border-light)",
                  backgroundColor: "white",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary-500)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px var(--primary-100)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
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
    </div>
  );
}
