import { useState } from "react";
import { Battery, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IMeal } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import { toLocalDateString } from "@/lib/dateUtils";
import { formatMealName } from "@/lib/formatters";

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

      if (response.success && response.data?.rescueMeal) {
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
        throw new Error(response.message || "Failed to get rescue meal");
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
      aria-label="I'm tired - swap to quick meal"
      title="Swap to a quick 10-minute meal"
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Battery className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">
        {isLoading ? "Finding..." : "I'm Tired"}
      </span>
    </button>
  );
};

export default TiredButton;
