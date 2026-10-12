import { IMeal } from "@/types/interfaces";
import ChangeMealModal from "@/components/modals/ChangeMealModal";
import Fatigue from "@/assets/quick_food.webp";

interface TiredButtonProps {
  meal: IMeal;
  mealType: "breakfast" | "lunch" | "dinner";
  date: string;
  onMealChange: (newMeal: IMeal) => void;
  className?: string;
}

/**
 * "No time" / "I'm tired": quicker alternatives for this meal.
 *
 * It used to swap in an AI meal the moment it was tapped — no choice, and the
 * user's own quick dishes were never considered. It now opens the quicker
 * options (own dishes first) with "No time" already given as the reason; the
 * user picks one, and can undo it.
 */
const TiredButton = ({
  meal,
  mealType,
  date,
  onMealChange,
  className = "",
}: TiredButtonProps) => {
  // Don't show button for breakfast (morning)
  if (mealType === "breakfast") {
    return null;
  }

  const buttonText = mealType === "lunch" ? "No time" : "I'm Tired";
  const ariaLabel =
    mealType === "lunch"
      ? "No time - show quicker options"
      : "I am tired - show quicker options";

  return (
    <ChangeMealModal
      currentMeal={meal}
      mealType={mealType}
      date={date}
      onMealChange={onMealChange}
      initialTab="quicker"
      initialReason="no_time"
    >
      <button
        type="button"
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5
          bg-amber-50 hover:bg-amber-100
          border border-amber-200
          text-amber-700 text-xs font-medium
          rounded-lg transition-all duration-200
          ${className}
        `}
        aria-label={ariaLabel}
        title="See quicker options"
      >
        <img src={Fatigue} alt="" className="w-8 h-8" />
        <span className="sm:inline">{buttonText}</span>
      </button>
    </ChangeMealModal>
  );
};

export default TiredButton;
