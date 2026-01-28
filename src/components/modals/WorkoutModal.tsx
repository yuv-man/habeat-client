import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { workoutCategories } from "@/lib/dietry";
import { calculateWorkoutCalories } from "@/lib/workoutHelper";
import { useAuthStore } from "@/stores/authStore";
import { Activity, Clock, Flame } from "lucide-react";
import { WorkoutData } from "@/types/interfaces";
import MealLoader from "../helper/MealLoader";

interface WorkoutModalProps {
  children: React.ReactNode;
  onWorkoutAdd: (workout: WorkoutData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const INITIAL_WORKOUT_DATA: WorkoutData = {
  name: "",
  caloriesBurned: 0,
  duration: 0,
  category: "",
  time: "12:00",
};

const WorkoutModal = ({
  children,
  onWorkoutAdd,
  open: controlledOpen,
  onOpenChange,
}: WorkoutModalProps) => {
  const { user } = useAuthStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const [workoutData, setWorkoutData] =
    useState<WorkoutData>(INITIAL_WORKOUT_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number>(0);

  const updateWorkoutData = (
    field: keyof WorkoutData,
    value: string | number
  ) => {
    setWorkoutData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate calories when workout type or duration changes
  useEffect(() => {
    if (workoutData.category && workoutData.duration > 0 && user?.weight) {
      const calories = calculateWorkoutCalories(
        workoutData.category,
        workoutData.duration,
        user.weight
      );
      setCalculatedCalories(calories);
      setWorkoutData((prev) => ({ ...prev, caloriesBurned: calories }));
    } else {
      setCalculatedCalories(0);
      setWorkoutData((prev) => ({ ...prev, caloriesBurned: 0 }));
    }
  }, [workoutData.category, workoutData.duration, user?.weight]);

  const resetForm = () => {
    setWorkoutData(INITIAL_WORKOUT_DATA);
    setCalculatedCalories(0);
  };

  const isFormValid = () => {
    return (
      workoutData.name.trim() !== "" &&
      workoutData.category !== "" &&
      workoutData.duration > 0 &&
      workoutData.time !== "" &&
      calculatedCalories > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onWorkoutAdd(workoutData);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add workout:", error);
      // Don't close modal on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
      setIsSubmitting(false);
    }
  };

  // Sync external open state
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Add New Workout
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="workout-name" className="text-sm font-medium">
              Workout Name
            </Label>
            <Input
              id="workout-name"
              placeholder="e.g., Running, Weight Training, Yoga"
              value={workoutData.name}
              onChange={(e) => updateWorkoutData("name", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout-type" className="text-sm font-medium">
              Workout Type
            </Label>
            <Select
              value={workoutData.category}
              onValueChange={(value) => updateWorkoutData("category", value)}
            >
              <SelectTrigger id="workout-type" className="h-11">
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() +
                      category.slice(1).replace(/-/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="workout-time"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Clock className="w-4 h-4 text-green-500" />
              Time
            </Label>
            <Input
              id="workout-time"
              type="time"
              value={workoutData.time || "12:00"}
              onChange={(e) => updateWorkoutData("time", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="workout-duration"
                className="text-sm font-medium flex items-center gap-1"
              >
                <Clock className="w-4 h-4 text-blue-500" />
                Duration (min)
              </Label>
              <Input
                id="workout-duration"
                type="number"
                placeholder="30"
                min="1"
                value={workoutData.duration || ""}
                onChange={(e) =>
                  updateWorkoutData("duration", parseInt(e.target.value) || 0)
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="workout-calories"
                className="text-sm font-medium flex items-center gap-1"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                Calories Burned
              </Label>
              <div className="relative">
                <Input
                  id="workout-calories"
                  type="number"
                  value={calculatedCalories || ""}
                  readOnly
                  className="h-11 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                {calculatedCalories > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Calculated
                  </div>
                )}
              </div>
              {!user?.weight && (
                <p className="text-xs text-amber-600 mt-1">
                  Weight not set. Calories calculation requires user weight.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 text-white hover:bg-green-600"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <MealLoader size="small" />
                  Adding...
                </>
              ) : (
                "Add Workout"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutModal;
