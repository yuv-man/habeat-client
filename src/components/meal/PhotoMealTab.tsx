import { useState } from "react";
import { Camera, RefreshCw, Check, Edit2, AlertCircle } from "lucide-react";
import { IMeal } from "@/types/interfaces";
import { userAPI, RecognizedMeal, USDANutrition } from "@/services/api";
import { takePhoto } from "@/services/cameraService";
import MealLoader from "@/components/helper/MealLoader";

interface PhotoMealTabProps {
  mealType: string;
  onMealSelected: (meal: IMeal) => Promise<void>;
  isSaving: boolean;
}

type PhotoState =
  | "idle"
  | "capturing"
  | "recognizing"
  | "recognized"
  | "fetching"
  | "reviewing"
  | "error";

const PhotoMealTab: React.FC<PhotoMealTabProps> = ({
  mealType,
  onMealSelected,
  isSaving,
}) => {
  const [state, setState] = useState<PhotoState>("idle");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [recognizedMeal, setRecognizedMeal] = useState<RecognizedMeal | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [nutrition, setNutrition] = useState<USDANutrition | null>(null);
  const [error, setError] = useState<string>("");
  const [useAiEstimates, setUseAiEstimates] = useState<boolean>(false);

  const handleTakePhoto = async () => {
    setState("capturing");
    setError("");

    try {
      const photo = await takePhoto();
      setPhotoBase64(photo.base64);
      setState("recognizing");

      // Send to AI for recognition
      const response = await userAPI.recognizeMealFromPhoto(photo.base64);
      const result = response.data;

      if (result.confidence === "none" || !result.mealName) {
        setRecognizedMeal(result);
        setEditedName("");
        setState("recognized");
        setError("Could not recognize the meal. Please enter the name manually.");
      } else {
        setRecognizedMeal(result);
        setEditedName(result.mealName);
        setState("recognized");
      }
    } catch (err: any) {
      console.error("Photo capture/recognition error:", err);
      setState("error");

      if (err.message?.toLowerCase().includes("permission")) {
        setError("Camera permission denied. Please enable camera access in your device settings.");
      } else if (err.message?.toLowerCase().includes("cancel")) {
        setState("idle");
      } else {
        setError(err.message || "Failed to capture or analyze photo. Please try again.");
      }
    }
  };

  const handleGetNutrition = async () => {
    if (!editedName.trim()) {
      setError("Please enter a meal name");
      return;
    }

    setState("fetching");
    setError("");
    setUseAiEstimates(false);

    try {
      const response = await userAPI.getNutritionFromUSDA(editedName.trim());

      if (response.data) {
        setNutrition(response.data);
        setState("reviewing");
      } else {
        // USDA didn't find data, offer to use AI estimates
        if (recognizedMeal?.aiEstimates) {
          setError("No USDA data found. You can use AI estimates instead.");
          setState("recognized");
        } else {
          setError(response.message || "No nutrition data found. Try a different meal name.");
          setState("recognized");
        }
      }
    } catch (err: any) {
      console.error("USDA nutrition error:", err);
      setError(err.message || "Failed to get nutrition data.");
      setState("recognized");
    }
  };

  const handleUseAiEstimates = () => {
    if (recognizedMeal?.aiEstimates) {
      setNutrition({
        calories: recognizedMeal.aiEstimates.calories,
        macros: recognizedMeal.aiEstimates.macros,
        servingSize: "1 serving (estimated)",
        source: "AI Estimate",
      });
      setUseAiEstimates(true);
      setState("reviewing");
    }
  };

  const handleApprove = async () => {
    if (!nutrition) return;

    const category =
      mealType === "snacks" ? "snack" : (mealType as "breakfast" | "lunch" | "dinner");

    const newMeal: IMeal = {
      _id: `photo-${Date.now()}`,
      name: editedName.trim(),
      calories: nutrition.calories,
      macros: {
        protein: nutrition.macros.protein,
        carbs: nutrition.macros.carbs,
        fat: nutrition.macros.fat,
      },
      category,
      ingredients: [],
      prepTime: 0,
      done: false,
    };

    await onMealSelected(newMeal);
  };

  const handleReset = () => {
    setState("idle");
    setPhotoBase64("");
    setRecognizedMeal(null);
    setEditedName("");
    setNutrition(null);
    setError("");
    setUseAiEstimates(false);
  };

  // Idle state - Show camera button
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <button
          onClick={handleTakePhoto}
          disabled={isSaving}
          className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition disabled:opacity-50"
        >
          <Camera className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600 font-medium">Take a Photo</span>
          <span className="text-sm text-gray-400">
            Snap a picture of your meal
          </span>
        </button>
      </div>
    );
  }

  // Capturing state
  if (state === "capturing") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse">
          <Camera className="w-12 h-12 text-emerald-500" />
        </div>
        <p className="text-gray-600 mt-4">Opening camera...</p>
      </div>
    );
  }

  // Recognizing state
  if (state === "recognizing") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <MealLoader
          size="default"
          customMessages={[
            "Analyzing your meal...",
            "Identifying ingredients...",
            "Consulting the AI chef...",
          ]}
        />
      </div>
    );
  }

  // Fetching nutrition state
  if (state === "fetching") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <MealLoader
          size="default"
          customMessages={[
            "Looking up nutrition...",
            "Searching USDA database...",
            "Calculating macros...",
          ]}
        />
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Recognized state - Show editable name
  if (state === "recognized") {
    return (
      <div className="space-y-4">
        {/* Photo Preview */}
        {photoBase64 && (
          <div className="relative">
            <img
              src={`data:image/jpeg;base64,${photoBase64}`}
              alt="Captured meal"
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Recognition Result */}
        {recognizedMeal && recognizedMeal.confidence !== "none" && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-emerald-800">
                AI recognized:
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  recognizedMeal.confidence === "high"
                    ? "bg-emerald-200 text-emerald-800"
                    : recognizedMeal.confidence === "medium"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {recognizedMeal.confidence} confidence
              </span>
            </div>
            <p className="text-sm text-gray-600">{recognizedMeal.description}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {/* Editable Meal Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meal Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter or correct the meal name"
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGetNutrition}
            disabled={!editedName.trim() || isSaving}
            className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            Get Nutrition Data
          </button>

          {/* AI Estimates fallback button */}
          {recognizedMeal?.aiEstimates && error && (
            <button
              onClick={handleUseAiEstimates}
              disabled={isSaving}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
            >
              Use AI Estimates Instead
            </button>
          )}
        </div>
      </div>
    );
  }

  // Reviewing state - Show nutrition for approval
  if (state === "reviewing" && nutrition) {
    return (
      <div className="space-y-4">
        {/* Photo Preview */}
        {photoBase64 && (
          <img
            src={`data:image/jpeg;base64,${photoBase64}`}
            alt="Captured meal"
            className="w-full h-32 object-cover rounded-lg"
          />
        )}

        {/* Meal Card */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">
            {editedName}
          </h3>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {nutrition.calories}
              </div>
              <div className="text-xs text-gray-500">cal</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {nutrition.macros.protein}g
              </div>
              <div className="text-xs text-gray-500">protein</div>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded">
              <div className="text-lg font-bold text-amber-600">
                {nutrition.macros.carbs}g
              </div>
              <div className="text-xs text-gray-500">carbs</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">
                {nutrition.macros.fat}g
              </div>
              <div className="text-xs text-gray-500">fat</div>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            {nutrition.servingSize} • {nutrition.source}
            {useAiEstimates && " (estimated)"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleApprove}
            disabled={isSaving}
            className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <MealLoader size="small" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Approve & Swap
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PhotoMealTab;
