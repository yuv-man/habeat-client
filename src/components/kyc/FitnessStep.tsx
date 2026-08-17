import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("onboarding");
  return (
    <KycLayout
      title={t("fitness.title")}
      description={t("fitness.description")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={t("common:buttons.continue")}
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
          {t("fitness.timesPerWeek")}
        </p>

        <p className="text-center text-gray-700 font-semibold mb-4">
          {t("fitness.question")}
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
