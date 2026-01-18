interface NutritionCircularProgressProps {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: string;
  size?: number;
}

export function NutritionCircularProgress({
  label,
  consumed,
  goal,
  unit = "",
  color,
  size = 40,
}: NutritionCircularProgressProps) {
  const percentage =
    goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-semibold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="text-gray-500 text-[10px]">{label}</p>
      <p className="font-semibold text-gray-900 text-[10px]">
        {Math.round(consumed)}
        {unit && `/${Math.round(goal)}${unit}`}
        {!unit && `/${Math.round(goal)}`}
      </p>
    </div>
  );
}
