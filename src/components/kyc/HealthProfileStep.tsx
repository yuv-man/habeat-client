import { Flame, Activity, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KYCData } from "./types";
import {
  calculateBMR,
  calculateTDEE,
  calculateIdealWeight,
} from "@/lib/calculations";
import KycLayout from "./KycLayout";

interface HealthProfileStepProps {
  kycData: KYCData;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function HealthProfileStep({
  kycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: HealthProfileStepProps) {
  const { t } = useTranslation("onboarding");
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
    <KycLayout
      title={t("healthProfile.title")}
      description={t("healthProfile.description")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={t("layout.completeRegistration")}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        {/* BMR Card */}
        <div className="p-6 rounded-2xl text-white shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold opacity-95">
              {t("healthProfile.bmrLabel")}
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            {Math.round(bmr)}{" "}
            <span className="text-sm font-normal opacity-80">{t("healthProfile.kcalPerDay")}</span>
          </div>
          <div className="text-xs opacity-70 mt-1">
            {t("healthProfile.bmrHint")}
          </div>
        </div>

        {/* TDEE Card */}
        <div className="p-6 rounded-2xl text-white shadow-md bg-gradient-to-br from-teal-500 to-teal-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold opacity-95">
              {t("healthProfile.tdeeLabel")}
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            {Math.round(tdee)}{" "}
            <span className="text-sm font-normal opacity-80">{t("healthProfile.kcalPerDay")}</span>
          </div>
          <div className="text-xs opacity-70 mt-1">
            {t("healthProfile.tdeeHint")}
          </div>
        </div>

        {/* Ideal Weight Card */}
        <div className="p-6 rounded-2xl text-white shadow-md bg-gradient-to-br from-green-600 to-green-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold opacity-95">
              {t("healthProfile.idealWeightLabel")}
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">
            {Math.round(idealWeight)}{" "}
            <span className="text-sm font-normal opacity-80">{t("healthProfile.kgUnit")}</span>
          </div>
          <div className="text-xs opacity-70 mt-1">
            {t("healthProfile.idealWeightHint")}
          </div>
        </div>
      </div>
    </KycLayout>
  );
}
