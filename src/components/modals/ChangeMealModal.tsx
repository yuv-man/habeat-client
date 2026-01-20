import { useState, useEffect, ReactNode } from "react";
import { X, Sparkles, Heart, AlertCircle, Camera, ArrowLeft, Edit } from "lucide-react";
import { IMeal } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { userAPI, MealCriteria } from "@/services/api";
import { getMealImageVite } from "@/lib/mealImageHelper";
import { toLocalDateString } from "@/lib/dateUtils";
import { formatMealName } from "@/lib/formatters";
import { toast } from "sonner";
import MealLoader from "@/components/helper/MealLoader";
import PhotoMealTab from "@/components/meal/PhotoMealTab";

interface ChangeMealModalProps {
  children: ReactNode;
  currentMeal?: IMeal;
  mealType: string;
  date: string; // Date in YYYY-MM-DD format for API call
  snackIndex?: number; // Index of the snack being changed (for snacks only)
  onMealChange: (meal: IMeal) => void;
}

type TabType = "manual" | "ai" | "favorites" | "photo" | null;

const ChangeMealModal = ({
  children,
  currentMeal,
  mealType,
  date,
  snackIndex,
  onMealChange,
}: ChangeMealModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual form state
  const [manualMeal, setManualMeal] = useState({
    name: "",
    calories: 250,
    carbs: 30,
    fat: 10,
    protein: 20,
    prepTime: 15,
  });

  // AI suggestion state
  const [aiRules, setAiRules] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<IMeal[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Favorites state - use store instead of local fetch
  const {
    user,
    plan,
    favoriteMealsData,
    favoriteMealsLoaded,
    fetchFavoriteMeals: fetchFavoritesFromStore,
  } = useAuthStore();
  const isLoadingFavorites = !favoriteMealsLoaded;

  // Fetch favorite meals when switching to favorites tab (only if not already loaded)
  useEffect(() => {
    if (activeTab === "favorites" && user?._id && !favoriteMealsLoaded) {
      fetchFavoritesFromStore(user._id);
    }
  }, [activeTab, user?._id, favoriteMealsLoaded, fetchFavoritesFromStore]);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
    setAiError(null);
    setActiveTab(null as any); // Reset to show option selection
    if (currentMeal) {
      setManualMeal({
        name: currentMeal.name,
        calories: currentMeal.calories,
        carbs: currentMeal.macros?.carbs || 0,
        fat: currentMeal.macros?.fat || 0,
        protein: currentMeal.macros?.protein || 0,
        prepTime: currentMeal.prepTime || 15,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab(null as any);
    setAiRules("");
    setAiSuggestions([]);
    setError(null);
    setAiError(null);
  };

  // API call to change the meal in the plan
  const changeMealAPI = async (newMeal: IMeal) => {
    if (!user?._id || !plan?._id) {
      throw new Error("User not authenticated or no plan found");
    }

    const dateString = toLocalDateString(date);

    try {
      await userAPI.changeMealInPlan(
        user._id,
        plan._id,
        dateString,
        mealType,
        newMeal,
        mealType === "snacks" ? snackIndex : undefined
      );
    } catch (error) {
      console.error("Failed to change meal via API:", error);
      throw error;
    }
  };

  const handleSaveManual = async () => {
    const newMeal: IMeal = {
      _id: `manual-${Date.now()}`,
      name: manualMeal.name,
      calories: manualMeal.calories,
      macros: {
        carbs: manualMeal.carbs,
        fat: manualMeal.fat,
        protein: manualMeal.protein,
      },
      category: mealType,
      ingredients: [],
      prepTime: manualMeal.prepTime,
      done: false,
    };

    setIsSaving(true);
    setError(null);

    try {
      await changeMealAPI(newMeal);
      onMealChange(newMeal);
      toast.success("Meal changed successfully!");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to change meal. Please try again.");
      toast.error("Failed to change meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAISuggest = async () => {
    if (!user?._id) {
      setAiError("Please log in to get AI suggestions");
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    setAiSuggestions([]);

    try {
      // Build meal criteria from user preferences and current meal
      const category =
        mealType === "snacks"
          ? "snack"
          : (mealType as "breakfast" | "lunch" | "dinner");
      const mealCriteria: MealCriteria = {
        category,
        targetCalories: currentMeal?.calories || 300,
        dietaryRestrictions: user.dietaryRestrictions || [],
        preferences: user.foodPreferences || [],
        dislikes: user.dislikes || [],
      };

      const response = await userAPI.getAIMealSuggestions(
        user._id,
        mealCriteria,
        aiRules || undefined
      );
      const suggestions = response.data?.meals || [];
      if (suggestions.length === 0) {
        setAiError("No suggestions found. Try different preferences.");
      } else {
        setAiSuggestions(suggestions);
      }
    } catch (err: any) {
      console.error("AI suggestion error:", err);
      setAiError(
        err.message || "Failed to get AI suggestions. Please try again."
      );
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectFavorite = async (meal: IMeal) => {
    setIsSaving(true);
    setError(null);

    try {
      await changeMealAPI(meal);
      onMealChange(meal);
      toast.success("Meal changed successfully!");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to change meal. Please try again.");
      toast.error("Failed to change meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAISuggestion = async (meal: IMeal) => {
    setIsSaving(true);
    setError(null);

    try {
      await changeMealAPI(meal);
      onMealChange(meal);
      toast.success("Meal changed successfully!");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to change meal. Please try again.");
      toast.error("Failed to change meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPhotoMeal = async (meal: IMeal) => {
    setIsSaving(true);
    setError(null);

    try {
      await changeMealAPI(meal);
      onMealChange(meal);
      toast.success("Meal changed successfully!");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to change meal. Please try again.");
      toast.error("Failed to change meal");
    } finally {
      setIsSaving(false);
    }
  };

  const swapOptions = [
    { 
      id: "ai" as TabType, 
      label: "AI Suggestion", 
      icon: Sparkles, 
      description: "Get smart meal recommendations",
      color: "purple"
    },
    { 
      id: "favorites" as TabType, 
      label: "From Favorites", 
      icon: Heart, 
      description: "Choose from your saved meals",
      color: "red"
    },
    { 
      id: "photo" as TabType, 
      label: "Take Photo", 
      icon: Camera, 
      description: "Recognize meal from photo",
      color: "blue"
    },
    { 
      id: "manual" as TabType, 
      label: "Manual Entry", 
      icon: Edit, 
      description: "Enter meal details manually",
      color: "gray"
    },
  ];

  return (
    <>
      <div onClick={handleOpen}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Swap Meal</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Choose how you want to swap this meal
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Option Selection - Show when no tab is selected or when activeTab is null */}
            {!activeTab && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {swapOptions.map((option) => {
                    const Icon = option.icon;
                    const colorClasses = {
                      purple: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
                      red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
                      blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                      gray: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
                    };
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => setActiveTab(option.id)}
                        disabled={isSaving}
                        className={`p-4 border-2 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[option.color as keyof typeof colorClasses]}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs opacity-75">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back Button - Show when a tab is selected */}
            {activeTab && (
              <div className="px-6 pt-4 pb-2">
                <button
                  onClick={() => {
                    setActiveTab(null);
                    setAiSuggestions([]);
                    setAiError(null);
                  }}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>
            )}

            {/* Content - Only show when a tab is selected */}
            {activeTab && (
              <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {swapOptions.find(opt => opt.id === activeTab)?.label}
                  </h3>
                </div>
                
                {/* Manual Tab */}
              {activeTab === "manual" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="meal-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meal Name
                    </label>
                    <input
                      id="meal-name"
                      type="text"
                      placeholder="E.g., Chicken Salad"
                      value={manualMeal.name}
                      onChange={(e) =>
                        setManualMeal({ ...manualMeal, name: e.target.value })
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="meal-calories"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Calories
                    </label>
                    <input
                      id="meal-calories"
                      type="number"
                      value={manualMeal.calories}
                      onChange={(e) =>
                        setManualMeal({
                          ...manualMeal,
                          calories: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="meal-carbs"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Carbs (g)
                      </label>
                      <input
                        id="meal-carbs"
                        type="number"
                        value={manualMeal.carbs}
                        onChange={(e) =>
                          setManualMeal({
                            ...manualMeal,
                            carbs: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="meal-fat"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fat (g)
                      </label>
                      <input
                        id="meal-fat"
                        type="number"
                        value={manualMeal.fat}
                        onChange={(e) =>
                          setManualMeal({
                            ...manualMeal,
                            fat: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="meal-protein"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Protein (g)
                      </label>
                      <input
                        id="meal-protein"
                        type="number"
                        value={manualMeal.protein}
                        onChange={(e) =>
                          setManualMeal({
                            ...manualMeal,
                            protein: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="meal-preptime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Prep Time (min)
                    </label>
                    <input
                      id="meal-preptime"
                      type="number"
                      value={manualMeal.prepTime}
                      onChange={(e) =>
                        setManualMeal({
                          ...manualMeal,
                          prepTime: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      disabled={isSaving}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <button
                    onClick={handleSaveManual}
                    disabled={!manualMeal.name.trim() || isSaving}
                    className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition mt-4 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <MealLoader size="small" />
                        Saving...
                      </>
                    ) : (
                      "Save Meal"
                    )}
                  </button>
                </div>
              )}

              {/* AI Suggestion Tab */}
              {activeTab === "ai" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Describe your preferences (optional)
                    </label>
                    <textarea
                      placeholder="E.g., High protein, low carb, vegetarian, under 400 calories..."
                      value={aiRules}
                      onChange={(e) => setAiRules(e.target.value)}
                      rows={3}
                      disabled={isLoadingAI || isSaving}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-gray-100"
                    />
                  </div>

                  <button
                    onClick={handleAISuggest}
                    disabled={isLoadingAI || isSaving}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isLoadingAI ? (
                      <MealLoader size="small" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get AI Suggestions
                      </>
                    )}
                  </button>

                  {/* AI Error */}
                  {aiError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {aiError}
                    </div>
                  )}

                  {/* AI Suggestions List */}
                  {aiSuggestions.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Suggested meals:
                      </p>
                      {aiSuggestions.map((meal) => (
                        <button
                          key={meal._id}
                          onClick={() => handleSelectAISuggestion(meal)}
                          disabled={isSaving}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium text-gray-900 break-words">
                            {formatMealName(meal.name)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {meal.calories} cal • {meal.macros?.protein || 0}g
                            protein • {meal.macros?.carbs || 0}g carbs •{" "}
                            {meal.macros?.fat || 0}g fat
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div className="space-y-3">
                  {isLoadingFavorites ? (
                    <div className="flex items-center justify-center py-8">
                      <MealLoader size="small" />
                    </div>
                  ) : favoriteMealsData && favoriteMealsData.length > 0 ? (
                    favoriteMealsData.map((meal) => (
                      <button
                        key={meal._id}
                        onClick={() => handleSelectFavorite(meal)}
                        disabled={isSaving}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src={getMealImageVite(meal.name)}
                          alt={formatMealName(meal.name)}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate" title={formatMealName(meal.name)}>
                            {formatMealName(meal.name)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {meal.calories} cal • {meal.macros?.protein || 0}g
                            protein
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No favorite meals yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Like meals to add them to your favorites
                      </p>
                    </div>
                  )}
                </div>
              )}

                {/* Photo Tab */}
                {activeTab === "photo" && (
                  <PhotoMealTab
                    mealType={mealType}
                    onMealSelected={handleSelectPhotoMeal}
                    isSaving={isSaving}
                  />
                )}
              </div>
            )}

            {/* Saving Overlay */}
            {isSaving && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600">
                  <MealLoader size="small" />
                  <span className="font-medium">Saving...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeMealModal;
