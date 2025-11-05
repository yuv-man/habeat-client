import { useState, memo, useCallback } from 'react';
import { IMeal } from '@/types/interfaces';
import fireIcon from '@/assets/fire.svg';
import clockIcon from '@/assets/clock.svg';
import checkedIcon from '@/assets/full_check.svg';
import uncheckedIcon from '@/assets/empty_check.svg';
import '@/styles/mealPlanCell.css';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface MealPlanCellProps {
  meal: IMeal;
  isEditMode: boolean;
  isToday: boolean;
  date: Date;
  onClick: () => void;
  onMealComplete: (date: Date, meal: IMeal) => void;
}

const MealPlanCell = memo(({ 
  meal, 
  isEditMode, 
  isToday, 
  date,
  onClick,
  onMealComplete
}: MealPlanCellProps) => {
  const now = new Date();
  const isPastDate = date < now;
  const [isCompleted, setIsCompleted] = useState(meal.done);
  const { user, updateMealInPlan } = useAuthStore();

  const onComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsCompleted(!isCompleted);
      userAPI.updateMealInPlan(user._id, date, {...meal, done: !isCompleted});
      onMealComplete(date, meal);
    } catch (error) {
      console.error('Error updating meal in plan:', error);
    }
  }, [user._id, date, meal, isCompleted, updateMealInPlan]);

  return (
    <div
      onClick={onClick}
      className={`grid-cell border-l ${isToday ? 'today' : ''} ${
        isEditMode && (isToday || date > now)
          ? 'cursor-pointer hover:bg-gray-50 hover:border-green-300' 
          : isPastDate
            ? 'bg-gray-50 opacity-75' 
            : ''
      }`}
    >
      <p className="cell-name-text" title={meal.name}>
        {meal.name}
      </p>
      <button 
        className="complete-button" 
        onClick={onComplete}
        type="button"
      >
        {isCompleted ? (
          <img src={checkedIcon} alt="complete" className="w-4 h-4" />
        ) : (
          <img src={uncheckedIcon} alt="incomplete" className="w-4 h-4" />
        )}
      </button>
      <div className="flex flex-row justify-between">
        <div className="info-container calories">
          <img src={fireIcon} alt="fire" />
          <p>{meal.calories}</p>
        </div>
        <div className="info-container time">
          <img src={clockIcon} alt="clock" />
          <p>{meal.prepTime}</p>
        </div>
      </div>
    </div>
  );
});

MealPlanCell.displayName = 'MealPlanCell';

export default MealPlanCell;