import { useTranslation } from "react-i18next";
import { KYCData } from "./types";
import KycLayout from "./KycLayout";

interface ProfileStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function ProfileStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: ProfileStepProps) {
  const { t } = useTranslation("onboarding");
  const isValid =
    kycData.weight && kycData.height && kycData.age && kycData.gender;

  return (
    <KycLayout
      title={t("profile.title")}
      description={t("profile.description")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={t("common:buttons.continue")}
      submitDisabled={!isValid}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            {t("profile.weight")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.weight}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, weight: e.target.value }))
              }
              className="w-full px-4 py-3 pe-12 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              {t("profile.weightUnit")}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            {t("profile.height")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.height}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, height: e.target.value }))
              }
              className="w-full px-4 py-3 pe-12 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              {t("profile.heightUnit")}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            {t("profile.age")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.age}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, age: e.target.value }))
              }
              className="w-full px-4 py-3 pe-16 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              {t("profile.ageUnit")}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            {t("profile.gender")}
          </label>
          <select
            value={kycData.gender}
            onChange={(e) =>
              setKycData((prev) => ({ ...prev, gender: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-xl text-base transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
          >
            <option value="">{t("profile.genderSelectPlaceholder")}</option>
            <option value="male">{t("profile.genderMale")}</option>
            <option value="female">{t("profile.genderFemale")}</option>
          </select>
        </div>
      </div>
    </KycLayout>
  );
}
