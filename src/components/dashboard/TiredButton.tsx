import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IMeal } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import { toLocalDateString } from "@/lib/dateUtils";
import { formatMealName } from "@/lib/formatters";
import Fatigue from "@/assets/quick_food.webp";

interface TiredButtonProps {
  meal: IMeal;
  mealType: "breakfast" | "lunch" | "dinner";
  date: string;
  onMealChange: (newMeal: IMeal) => void;
  className?: string;
}

const TiredButton = ({
  meal,
  mealType,
  date,
  onMealChange,
  className = "",
}: TiredButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, plan } = useAuthStore();

  const handleTiredClick = async () => {
    if (!user?._id || !plan?._id) {
      toast.error("Please log in to use this feature");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Show optimistic toast immediately
    const toastId = toast.loading("Finding a quick meal for you...", {
      description: "Hang tight, this will only take a moment",
    });

    try {
      const dateString = toLocalDateString(date);

      const response = await userAPI.getRescueMeal(
        user._id,
        plan._id,
        dateString,
        mealType,
        meal.calories,
        meal.macros
      );

      if (response.data && response.data?.rescueMeal) {
        const newMeal = response.data.rescueMeal;

        // Trigger callback to update UI
        onMealChange(newMeal);

        // Success toast with meal info
        toast.success(`Swapped to ${formatMealName(newMeal.name)}!`, {
          id: toastId,
          description: `${newMeal.prepTime} min prep • ${newMeal.calories} kcal`,
          duration: 3000,
        });
      } else {
        throw new Error("Failed to get rescue meal");
      }
    } catch (error: any) {
      console.error("Rescue meal error:", error);
      toast.error("Couldn't find a quick meal", {
        id: toastId,
        description: "Please try again or swap manually",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for breakfast (morning)
  if (mealType === "breakfast") {
    return null;
  }

  // Get button text based on meal type
  const getButtonText = () => {
    if (mealType === "lunch") return "No time";
    return "I'm Tired";
  };

  const buttonText = getButtonText();
  const ariaLabel =
    mealType === "lunch"
      ? "No time - swap to quick meal"
      : "I am tired - swap to quick meal";

  return (
    <button
      onClick={handleTiredClick}
      disabled={isLoading}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5
        bg-amber-50 hover:bg-amber-100
        border border-amber-200
        text-amber-700 text-xs font-medium
        rounded-lg transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${isLoading ? "animate-pulse" : ""}
        ${className}
      `}
      aria-label={ariaLabel}
      title="Swap to a quick 10-minute meal"
    >
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <img src={Fatigue} alt="Fatigue" className="w-8 h-8" />
      )}
      <span className="sm:inline">{isLoading ? "Finding..." : buttonText}</span>
    </button>
  );
};

export default TiredButton;
