import { NutritionCircularProgress } from "./NutritionCircularProgress";

interface NutritionData {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: string;
}

interface NutritionCircularProgressGridProps {
  items: NutritionData[];
  columns?: number;
  gap?: number;
}

export function NutritionCircularProgressGrid({
  items,
  columns = 4,
  gap = 3,
}: NutritionCircularProgressGridProps) {
  return (
    <div
      className={`grid text-xs`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {items.map((item, index) => (
        <NutritionCircularProgress
          key={index}
          label={item.label}
          consumed={item.consumed}
          goal={item.goal}
          unit={item.unit}
          color={item.color}
        />
      ))}
    </div>
  );
}
