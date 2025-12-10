import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Loader, Clock } from "lucide-react";
import { KYCData } from "./types";

interface FastingHoursStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function FastingHoursStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
}: FastingHoursStepProps) {
  const [fastingHours, setFastingHours] = useState(
    kycData.fastingHours?.toString() || "16"
  );
  const [fastingStartTime, setFastingStartTime] = useState(
    kycData.fastingStartTime || "20:00"
  );

  const handleSubmit = () => {
    const hours = parseInt(fastingHours);
    if (hours < 8 || hours > 16) {
      return;
    }
    setKycData((prev) => ({
      ...prev,
      fastingHours: hours,
      fastingStartTime: fastingStartTime,
    }));
    onSubmit();
  };

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
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-8 h-8 text-green-500" />
          <h1 className="text-4xl font-bold text-gray-900">
            Set Your Fasting Schedule
          </h1>
        </div>
        <p className="text-gray-600 text-lg mb-8">
          Configure your 8-16 hour intermittent fasting window.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-8">
          {/* Fasting Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasting Duration (hours)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="8"
                max="16"
                value={fastingHours}
                onChange={(e) => setFastingHours(e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-bold text-gray-900">
                  {fastingHours}
                </span>
                <span className="text-sm text-gray-600 ml-1">hrs</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select between 8-16 hours of fasting
            </p>
          </div>

          {/* Fasting Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasting Start Time
            </label>
            <input
              type="time"
              value={fastingStartTime}
              onChange={(e) => setFastingStartTime(e.target.value)}
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              When do you start your fasting period? (e.g., 8:00 PM)
            </p>
          </div>

          {/* Preview */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Your Fasting Schedule:
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-semibold">Fasting:</span>{" "}
                {fastingStartTime} -{" "}
                {(() => {
                  const [hours, minutes] = fastingStartTime
                    .split(":")
                    .map(Number);
                  const startDate = new Date();
                  startDate.setHours(hours, minutes, 0, 0);
                  const endDate = new Date(startDate);
                  endDate.setHours(endDate.getHours() + parseInt(fastingHours));
                  return endDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                })()}
              </div>
              <div>
                <span className="font-semibold">Eating Window:</span>{" "}
                {(() => {
                  const [hours, minutes] = fastingStartTime
                    .split(":")
                    .map(Number);
                  const startDate = new Date();
                  startDate.setHours(hours, minutes, 0, 0);
                  const endDate = new Date(startDate);
                  endDate.setHours(endDate.getHours() + parseInt(fastingHours));
                  const eatingStart = endDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const eatingEnd = new Date(startDate);
                  eatingEnd.setDate(eatingEnd.getDate() + 1);
                  return `${eatingStart} - ${eatingEnd.toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}`;
                })()}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !fastingHours || !fastingStartTime}
          className={`w-full h-12 px-3 flex items-center justify-center gap-2 font-open text-lg font-semibold border-none rounded-xl transition ${
            fastingHours && fastingStartTime
              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none`}
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
