import { useState } from "react";
import { KYCData } from "./types";
import KycLayout from "./KycLayout";

interface FastingHoursStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function FastingHoursStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
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

  const isValid = fastingHours && fastingStartTime;

  return (
    <KycLayout
      title="Fasting Schedule"
      description="Configure your intermittent fasting window (8-16 hours)."
      onBack={onBack}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      submitDisabled={!isValid}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        {/* Fasting Hours */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            Fasting Duration
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="8"
              max="16"
              value={fastingHours}
              onChange={(e) => setFastingHours(e.target.value)}
              className="flex-1 h-3 bg-green-200 rounded-full appearance-none cursor-pointer accent-green-500"
            />
            <div className="w-20 text-center">
              <span className="text-3xl font-bold text-gray-900">
                {fastingHours}
              </span>
              <span className="text-sm text-gray-600 ml-1">hrs</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select between 8-16 hours of fasting
          </p>
        </div>

        {/* Fasting Start Time */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            Start Time
          </label>
          <input
            type="time"
            value={fastingStartTime}
            onChange={(e) => setFastingStartTime(e.target.value)}
            className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 bg-white"
          />
          <p className="text-xs text-gray-500 mt-2">
            When do you start your fasting period?
          </p>
        </div>

        {/* Preview */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            Your Fasting Schedule:
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <span className="font-medium">Fasting:</span> {fastingStartTime} →{" "}
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
              <span className="font-medium">Eating Window:</span>{" "}
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
                return `${eatingStart} → ${eatingEnd.toLocaleTimeString(
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
    </KycLayout>
  );
}
