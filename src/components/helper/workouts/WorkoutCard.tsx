import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import addCircle from "@/assets/add_circle.svg";
import workoutIcon from "@/assets/workout.svg";
import WorkoutItemCard from "./WorkoutItemCard";
import WorkoutModal from "@/components/modals/WorkoutModal";
import "@/styles/dailyScreen.css";
import { WorkoutData } from "@/types/interfaces";

interface WorkoutCardProps {
  date: string;
  current: number;
  goal: number;
  workouts: {
    name: string;
    category: string;
    caloriesBurned: string;
    duration: string;
    done: boolean;
  }[];
  onWorkoutAdd: (workout: WorkoutData) => void;
  onWorkoutCompleted: (workout: WorkoutData) => void;
}

const WorkoutCard = ({ current, goal, onWorkoutAdd, workouts, date, onWorkoutCompleted }: WorkoutCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [workoutsProgress, setWorkoutsProgress] = useState(workouts);
  const totalCalories = workouts.reduce((acc, item) => acc + parseInt(item.caloriesBurned), 0);

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  
  const onWorkoutRemoved = (workout: WorkoutData) => {
    console.log(workout);
  };

  return (
    <div className="mealCard">
      <div className="pb-3 flex justify-between items-center p-2">
        <div className="flex items-center gap-3">
          <img src={workoutIcon} alt="workout" className="w-10 h-10" />
          <div className="flex flex-col text-md font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <span className="capitalize text-gray-800">Workout</span>
              <span className="text-sm font-medium text-red-600">
                {totalCalories} cal burned
              </span>
            </div>
            <div className="text-xs text-red-300">
              {workoutsProgress.filter(workout => workout.done).length}/{goal} workouts completed
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              onClick={toggleActions}
            >
              <img src={addCircle} alt="add circle" className="w-6 h-6" />
            </div>
            
            {/* Action Buttons - Small buttons under addCircle */}
            <div className={`absolute top-full right-0 mt-2 transition-all duration-200 z-50 ${
              showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-2 min-w-[120px]">
                <WorkoutModal onWorkoutAdd={onWorkoutAdd}>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="w-full justify-start text-xs h-8 px-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Workout
                  </Button>
                </WorkoutModal>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exercise Progress Display */}
      {workoutsProgress.length > 0 && (
        <div className="workout-items-container">
          {workoutsProgress.map((item, index) => (
            <WorkoutItemCard key={index} item={item} onComplete={() => onWorkoutCompleted(item)} onRemove={onWorkoutRemoved} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutCard;
