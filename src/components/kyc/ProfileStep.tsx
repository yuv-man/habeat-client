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
  const isValid =
    kycData.weight && kycData.height && kycData.age && kycData.gender;

  return (
    <KycLayout
      title="Your Profile"
      description="Help us personalize your plans by telling us a bit about yourself."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      submitDisabled={!isValid}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            Weight
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.weight}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, weight: e.target.value }))
              }
              className="w-full px-4 py-3 pr-12 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              kg
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            Height
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.height}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, height: e.target.value }))
              }
              className="w-full px-4 py-3 pr-12 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              cm
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            Age
          </label>
          <div className="relative">
            <input
              type="number"
              value={kycData.age}
              onChange={(e) =>
                setKycData((prev) => ({ ...prev, age: e.target.value }))
              }
              className="w-full px-4 py-3 pr-16 rounded-xl text-center text-lg transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-semibold text-gray-500">
              years
            </div>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-3 text-gray-900">
            Gender
          </label>
          <select
            value={kycData.gender}
            onChange={(e) =>
              setKycData((prev) => ({ ...prev, gender: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-xl text-base transition-all border-2 border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
    </KycLayout>
  );
}
