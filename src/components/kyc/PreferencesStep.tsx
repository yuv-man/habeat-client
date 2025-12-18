import React from "react";
import { ChevronRight, ChevronLeft, Loader } from "lucide-react";
import {
  KYCData,
  CustomInputs,
  allergies,
  dislikes,
  foodPreferences,
} from "./types.tsx";

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
}

export default function PreferencesStep({
  kycData,
  setKycData,
  customInputs,
  setCustomInputs,
  loading,
  error,
  onSubmit,
  onToggleOption,
  onAddCustomItem,
  onBack,
}: PreferencesStepProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <button
        onClick={onBack}
        disabled={loading}
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition disabled:opacity-50 z-10"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Tell Us Your Preferences
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Select all that apply to personalize your meal and workout plans.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-10 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Allergies</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {allergies.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("allergies", item)}
                  className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                    kycData.allergies.includes(item)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition flex items-center gap-1"
                  >
                    {item} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dislikes</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {dislikes.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("dislikes", item)}
                  className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                    kycData.dislikes.includes(item)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition flex items-center gap-1"
                  >
                    {item} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Food Preferences
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {foodPreferences.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggleOption("foodPreferences", item)}
                  className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                    kycData.foodPreferences.includes(item)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition flex items-center gap-1"
                  >
                    {item} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-12 px-3 flex items-center justify-center gap-2 font-open text-lg font-semibold border-none rounded-xl transition bg-green-500 hover:bg-green-600 text-white shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Continue <ChevronRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
