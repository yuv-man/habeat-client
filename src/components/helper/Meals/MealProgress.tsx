import { memo } from 'react';
import { Progress } from "@/components/ui/progress";
import { IDailyPlan } from '@/types/interfaces';
import { useShowMacros } from '@/hooks/useShowMacros';

interface MealProgressProps {
  dayPlan: IDailyPlan;
  isToday: boolean;
  isMealProgressChanged: number;
}

const calculateMealProgress = (meals: IDailyPlan['meals']) => {
  const allMeals = Object.values(meals).flat();
  const totalMeals = allMeals.length;
  const completedMeals = allMeals.filter(meal => meal.done).length;
  return Math.round((completedMeals / totalMeals) * 100);
};

const MealProgress = memo(({ dayPlan, isToday }: MealProgressProps) => {
  const progress = calculateMealProgress(dayPlan.meals);
  const showMacros = useShowMacros();

  return (
    <div className={`grid-cell border-l ${isToday ? 'today' : ''}`}>
      <div className="flex justify-between text-xs mb-1">
        <span>{progress}%</span>
        {showMacros && <span className="text-gray-500">{dayPlan.netCalories}</span>}
      </div>
      <Progress 
        value={progress}
        className="h-1"
      />
    </div>
  );
});

MealProgress.displayName = 'MealProgress';

export default MealProgress;