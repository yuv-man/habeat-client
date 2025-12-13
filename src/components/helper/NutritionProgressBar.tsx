interface NutritionProgressBarProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: "orange" | "purple" | "blue" | "red" | "green" | "teal";
  showPercentage?: boolean;
}

const colorClasses: Record<NutritionProgressBarProps["color"], string> = {
  orange: "bg-orange-500",
  purple: "bg-purple-400",
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
};

const NutritionProgressBar = ({
  label,
  consumed,
  goal,
  unit,
  color,
  showPercentage = true,
}: NutritionProgressBarProps) => {
  // Calculate actual percentage (can exceed 100%)
  const actualPercentage = goal > 0 ? Math.round((consumed / goal) * 100) : 0;
  // Bar width is capped at 100%
  const barWidth = Math.min(actualPercentage, 100);
  // Check if over goal
  const isOverGoal = actualPercentage > 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">
            {Math.round(consumed)} / {Math.round(goal)} {unit}
          </span>
          {showPercentage && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                isOverGoal
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {actualPercentage}%
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

export default NutritionProgressBar;
