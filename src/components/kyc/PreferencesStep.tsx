import {
  KYCData,
  CustomInputs,
  allergies,
  dislikes,
  foodPreferences,
} from "./types";
import KycLayout from "./KycLayout";

interface PreferencesStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  customInputs: CustomInputs;
  setCustomInputs: React.Dispatch<React.SetStateAction<CustomInputs>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onToggleOption: (list: string, value: string) => void;
  onAddCustomItem: (category: string, inputKey: string) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function PreferencesStep({
  kycData,
  customInputs,
  setCustomInputs,
  loading,
  error,
  onSubmit,
  onToggleOption,
  onAddCustomItem,
  onBack,
  currentStep,
  totalSteps,
}: PreferencesStepProps) {
  return (
    <KycLayout
      title="Preferences"
      description="Select all that apply to personalize your meal and workout plans."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-8">
        {/* Allergies */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Allergies</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {allergies.map((item) => (
              <button
                key={item}
                onClick={() => onToggleOption("allergies", item)}
                className={`px-3 py-1.5 rounded-full font-medium transition text-sm ${
                  kycData.allergies.includes(item)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom allergy..."
              value={customInputs.allergy}
              onChange={(e) =>
                setCustomInputs((prev) => ({
                  ...prev,
                  allergy: e.target.value,
                }))
              }
              onKeyPress={(e) =>
                e.key === "Enter" && onAddCustomItem("allergies", "allergy")
              }
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            />
            <button
              onClick={() => onAddCustomItem("allergies", "allergy")}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm"
            >
              Add
            </button>
          </div>
          {kycData.allergies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {kycData.allergies.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("allergies", item)}
                  className="px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition flex items-center gap-1"
                >
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dislikes */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Dislikes</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {dislikes.map((item) => (
              <button
                key={item}
                onClick={() => onToggleOption("dislikes", item)}
                className={`px-3 py-1.5 rounded-full font-medium transition text-sm ${
                  kycData.dislikes.includes(item)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom dislike..."
              value={customInputs.dislike}
              onChange={(e) =>
                setCustomInputs((prev) => ({
                  ...prev,
                  dislike: e.target.value,
                }))
              }
              onKeyPress={(e) =>
                e.key === "Enter" && onAddCustomItem("dislikes", "dislike")
              }
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={() => onAddCustomItem("dislikes", "dislike")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition text-sm"
            >
              Add
            </button>
          </div>
          {kycData.dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {kycData.dislikes.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("dislikes", item)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 transition flex items-center gap-1"
                >
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Food Preferences */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Food Preferences
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {foodPreferences.map((item) => (
              <button
                key={item}
                onClick={() => onToggleOption("foodPreferences", item)}
                className={`px-3 py-1.5 rounded-full font-medium transition text-sm ${
                  kycData.foodPreferences.includes(item)
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add food preference..."
              value={customInputs.foodPreference}
              onChange={(e) =>
                setCustomInputs((prev) => ({
                  ...prev,
                  foodPreference: e.target.value,
                }))
              }
              onKeyPress={(e) =>
                e.key === "Enter" &&
                onAddCustomItem("foodPreferences", "foodPreference")
              }
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={() =>
                onAddCustomItem("foodPreferences", "foodPreference")
              }
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition text-sm"
            >
              Add
            </button>
          </div>
          {kycData.foodPreferences.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {kycData.foodPreferences.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("foodPreferences", item)}
                  className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs hover:bg-purple-600 transition flex items-center gap-1"
                >
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </KycLayout>
  );
}
