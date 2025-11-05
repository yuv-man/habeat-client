import { WorkoutData } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

export const onWorkoutCompleted = async (workout: WorkoutData, date: string) => {
    const { user } = useAuthStore();
    if (user?._id) {
      try {
        const updatedWorkout = {
          ...workout,
          done: !workout.done
        }
        const response = await userAPI.completeWorkout(user._id, date, updatedWorkout);
        if (response.data.success) {
          return response.data.progress.workouts;
        }
        return null;
      } catch (error) {
        console.error('Failed to complete workout:', error);
        return null;
      }
    }
  };