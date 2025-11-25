import { Clock } from "lucide-react";
import { IMeal } from "@/types/interfaces";

interface TableMealItemProps {
  meal: IMeal;
  onSwap: () => void;
}

const TableMealItem = ({ meal, onSwap }: TableMealItemProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {meal.name}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>🔥</span>
            {meal.calories} kcal
          </span>
          {meal.prepTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meal.prepTime} min
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onSwap}
        className="text-green-500 hover:bg-green-50 px-2 py-1 rounded text-xs font-medium transition flex-shrink-0"
      >
        Change
      </button>
    </div>
  </div>
);

export default TableMealItem;
