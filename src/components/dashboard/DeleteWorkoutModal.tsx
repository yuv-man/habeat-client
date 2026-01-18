import { X } from "lucide-react";
import { WorkoutData } from "@/types/interfaces";

interface DeleteWorkoutModalProps {
  workout: WorkoutData;
  onCancel: () => void;
  onConfirm: (workout: WorkoutData) => void;
}

export function DeleteWorkoutModal({
  workout,
  onCancel,
  onConfirm,
}: DeleteWorkoutModalProps) {
  const handleConfirm = () => {
    onConfirm(workout);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Workout
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900">{workout.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
