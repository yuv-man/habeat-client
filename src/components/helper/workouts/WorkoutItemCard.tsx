import "@/styles/mealItemCard.css";
import checkCircle from "@/assets/check_circle_green.svg";
import removeIcon from "@/assets/close.svg";
import fireIcon from "@/assets/fire.svg";
import uncheckedIcon from "@/assets/empty_check.svg";
import { WorkoutData } from "@/types/interfaces";

interface ExerciseItemCardProps {
  item: {
    name: string;
    category: string;
    caloriesBurned: string;
    duration: string;
    done: boolean;
  };
  onComplete: (item: WorkoutData) => void;
  onRemove: (item: WorkoutData) => void;
}

const ExerciseItemCard = ({ item, onComplete, onRemove }: ExerciseItemCardProps) => {
  const handleWorkoutComplete = (item: WorkoutData) => {
    onComplete(item);
  };
  const handleWorkoutRemove = (item: WorkoutData) => {
    onRemove(item);
  };
  return (
    <div className="mealItemCard">
        <div className="flex justify-between">
            <div className="mealItemCardHeader">
                <div className="mealItemCardHeaderText">{item.name}</div>
                <div className="mealItemCardHeaderCheck" onClick={() => handleWorkoutComplete(item)}>
                    {item.done ? <img src={checkCircle} alt="check circle" className="w-4 h-4" /> : <img src={uncheckedIcon} alt="check circle" className="w-4 h-4" />}
                </div>
            </div>
            <div className="mealItemCardRemove">
                <img src={removeIcon} alt="remove" className="w-4 h-4" />
            </div>
        </div>
        <div className="flex flex-row gap-6">
            <div className="mealItemCardCalories flex flex-row gap-1">
                <img src={fireIcon} alt="fire" className="w-4 h-4" />
                {item.caloriesBurned} cal
            </div>
            <div className="mealItemCardMinutes">{item.duration} min</div>
        </div>
    </div>
  );
};

export default ExerciseItemCard;
