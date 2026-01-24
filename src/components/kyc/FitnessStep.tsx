import { KYCData } from "./types";
import KycLayout from "./KycLayout";

interface FitnessStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function FitnessStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: FitnessStepProps) {
  return (
    <KycLayout
      title="Fitness Goal"
      description="Help us tailor your plans by letting us know your weekly workout frequency."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="mb-8">
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
    </KycLayout>
  );
}
