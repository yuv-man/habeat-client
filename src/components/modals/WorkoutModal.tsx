import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { workoutCategories } from "@/lib/dietry";
import { Activity, Clock, Flame } from "lucide-react";
import { WorkoutData } from "@/types/interfaces";

interface WorkoutModalProps {
  children: React.ReactNode;
  onWorkoutAdd: (workout: WorkoutData) => void;
}

const INITIAL_WORKOUT_DATA: WorkoutData = {
  name: '',
  caloriesBurned: '',
  duration: '',
  category: '',
};

const WorkoutModal = ({ children, onWorkoutAdd }: WorkoutModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData>(INITIAL_WORKOUT_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateWorkoutData = (field: keyof WorkoutData, value: string) => {
    setWorkoutData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setWorkoutData(INITIAL_WORKOUT_DATA);
  };

  const isFormValid = () => {
    return Object.values(workoutData).every(value => value.trim() !== '');
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    try {
      await onWorkoutAdd(workoutData);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add workout:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Add New Workout
          </DialogTitle>
        </DialogHeader>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-2">
            <Label htmlFor="workout-name" className="text-sm font-medium">
              Workout Name
            </Label>
            <Input
              id="workout-name"
              placeholder="e.g., Running, Weight Training, Yoga"
              value={workoutData.name}
              onChange={(e) => updateWorkoutData('name', e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout-category" className="text-sm font-medium">
              Category
            </Label>
            <Select 
              value={workoutData.category} 
              onValueChange={(value) => updateWorkoutData('category', value)}
            >
              <SelectTrigger id="workout-category" className="h-11">
                <SelectValue placeholder="Select workout category" />
              </SelectTrigger>
              <SelectContent>
                {workoutCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout-calories" className="text-sm font-medium flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                Calories Burned
              </Label>
              <Input
                id="workout-calories"
                type="number"
                placeholder="150"
                min="1"
                value={workoutData.caloriesBurned}
                onChange={(e) => updateWorkoutData('caloriesBurned', e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout-duration" className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                Duration (min)
              </Label>
              <Input
                id="workout-duration"
                type="number"
                placeholder="30"
                min="1"
                value={workoutData.duration}
                onChange={(e) => updateWorkoutData('duration', e.target.value)}
                className="h-11"
              />
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
              className="flex-1"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Workout'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutModal;