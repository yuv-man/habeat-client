import { Trans, useTranslation } from "react-i18next";
import { KYCData, FOOD_RELATIONSHIP_OPTIONS, EMOTIONAL_TRIGGERS } from "./types";
import KycLayout from "./KycLayout";

interface EmotionalEatingStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function EmotionalEatingStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: EmotionalEatingStepProps) {
  const { t } = useTranslation("onboarding");
  const selectedRelationship = kycData.foodRelationship ?? "";
  const selectedTriggers = kycData.emotionalTriggers ?? [];
  const isUnsure = selectedRelationship === "unsure";

  const selectRelationship = (id: string) => {
    setKycData((prev) => ({
      ...prev,
      foodRelationship: id,
      emotionalTriggers: id === "unsure" ? [] : (prev.emotionalTriggers ?? []),
    }));
  };

  const toggleTrigger = (id: string) => {
    setKycData((prev) => {
      const current = prev.emotionalTriggers ?? [];
      return {
        ...prev,
        emotionalTriggers: current.includes(id)
          ? current.filter((t) => t !== id)
          : [...current, id],
      };
    });
  };

  return (
    <KycLayout
      title={t("emotionalEating.title")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={t("common:buttons.continue")}
      submitDisabled={!selectedRelationship}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      {/* Empathy banner */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-s-4 border-orange-400 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-900 leading-relaxed">
          <Trans i18nKey="emotionalEating.empathyBanner" t={t} components={{ em: <em /> }} />
        </p>
      </div>

      {/* Self-assessment */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          {t("emotionalEating.relationshipQuestion")}
        </h3>
        <p className="text-xs text-gray-400 mb-3">{t("emotionalEating.chooseOne")}</p>
        <div className="space-y-2">
          {FOOD_RELATIONSHIP_OPTIONS.map((opt) => {
            const selected = selectedRelationship === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => selectRelationship(opt.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                  selected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span
                  className={`text-sm ${
                    selected ? "text-green-700 font-semibold" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional: trigger chips or soft message */}
      {selectedRelationship && (
        isUnsure ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              {t("emotionalEating.unsureTitle")}
            </p>
            <p className="text-xs text-green-700 leading-relaxed">
              {t("emotionalEating.unsureDescription")}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {t("emotionalEating.triggersQuestion")}
            </h3>
            <p className="text-xs text-gray-400 mb-3">{t("emotionalEating.triggersHint")}</p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONAL_TRIGGERS.map((trigger) => {
                const active = selectedTriggers.includes(trigger.id);
                return (
                  <button
                    key={trigger.id}
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs transition-all duration-150 ${
                      active
                        ? "border-green-500 bg-green-50 text-green-700 font-medium"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{trigger.emoji}</span>
                    <span>{trigger.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </KycLayout>
  );
}
