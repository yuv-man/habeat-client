import { Clock } from "lucide-react";
import { IMeal } from "@/types/interfaces";
import ChangeMealModal from "@/components/modals/ChangeMealModal";
import { formatMealName } from "@/lib/formatters";

interface TableMealItemProps {
  meal: IMeal;
  mealType: string;
  date: string; // Date in YYYY-MM-DD format
  snackIndex?: number; // Index of snack (for snacks only)
  onMealChange: (newMeal: IMeal) => void;
}

const TableMealItem = ({
  meal,
  mealType,
  date,
  snackIndex,
  onMealChange,
}: TableMealItemProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium text-gray-900 truncate"
          title={formatMealName(meal.name)}
        >
          {formatMealName(meal.name)}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>🔥</span>
            {meal.calories} kcal
          </span>
          {mealType !== "snacks" && meal.prepTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meal.prepTime} min
            </span>
          )}
        </div>
      </div>
      <ChangeMealModal
        currentMeal={meal}
        mealType={mealType}
        date={date}
        snackIndex={mealType === "snacks" ? snackIndex : undefined}
        onMealChange={onMealChange}
      >
        <button className="text-green-500 hover:bg-green-50 px-2 py-1 rounded text-xs font-medium transition flex-shrink-0">
          Change
        </button>
      </ChangeMealModal>
    </div>
  </div>
);

export default TableMealItem;
