import { useTranslation } from "react-i18next";
import { KYCData } from "./types";
import KycLayout from "./KycLayout";
import { COOKING_LEVEL_OPTIONS, CookingLevel } from "@/lib/cookingLevels";

interface CookingLevelStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function CookingLevelStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: CookingLevelStepProps) {
  const { t } = useTranslation("onboarding");
  const selected = kycData.cookingLevel;

  const select = (id: CookingLevel) =>
    setKycData((prev) => ({ ...prev, cookingLevel: id }));

  return (
    <KycLayout
      title={t("cooking.title")}
      description={t("cooking.description")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={t("common:buttons.continue")}
      submitDisabled={!selected}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-3">
        {COOKING_LEVEL_OPTIONS.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => select(option.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-start transition-all duration-150 ${
                active
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-2xl leading-none mt-0.5">{option.emoji}</span>
              <span className="flex-1">
                <span
                  className={`block text-sm font-semibold ${
                    active ? "text-green-700" : "text-gray-900"
                  }`}
                >
                  {t(`cooking.levels.${option.id}.label`)}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {t(`cooking.levels.${option.id}.description`)}
                </span>
                {/* The ceiling the generator will actually apply. Stating it
                    turns a vague self-assessment into a concrete promise. */}
                <span className="block text-xs font-medium text-gray-400 mt-1">
                  {t("cooking.upToMinutes", { minutes: option.maxPrepMinutes })}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
        {t("cooking.changeLater")}
      </p>
    </KycLayout>
  );
}
