import { useTranslation } from "react-i18next";
import { IMeal } from "@/types/interfaces";

/**
 * One line under a meal's name when it is one of the user's own dishes, or a
 * lighter swap for one — so the plan says whose food this is. What is served
 * next to it is the side chip's job (SideChip).
 */
const OwnDishNote = ({ meal, className = "" }: { meal: IMeal; className?: string }) => {
  const { t } = useTranslation("myMeals");
  if (!meal.fromRepertoire) return null;

  const text = meal.insteadOf
    ? t("inPlan.swapFor", { dish: meal.insteadOf })
    : t("inPlan.yourDish");

  return <p className={`break-words ${className}`}>{text}</p>;
};

export default OwnDishNote;
