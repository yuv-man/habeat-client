import { useState } from "react";
import { GlassWater, Plus, Trash2, X } from "lucide-react";
import { IDailyPlan, IMeal, WorkoutData } from "@/types/interfaces";
import TableMealItem from "./TableMealItem";
import WorkoutModal from "@/components/modals/WorkoutModal";

type PlanWorkout = IDailyPlan["workouts"][number];

interface WeeklyPlanTableProps {
  weeklyPlan: { [date: string]: IDailyPlan };
  dates: string[];
  onMealChange: (date: string, mealType: string, newMeal: IMeal) => void;
  onDeleteSnack?: (date: string, snackId: string) => void;
  onAddSnack?: (date: string) => void;
  onDeleteWorkout?: (date: string, workout: PlanWorkout) => void;
  onAddWorkout?: (date: string, workout: WorkoutData) => void;
  getDayName: (dateStr: string) => string;
  formatDate: (dateStr: string) => string;
}

interface DeleteConfirmation {
  type: "snack" | "workout";
  date: string;
  snackId?: string;
  workout?: PlanWorkout;
  name: string;
}

const WeeklyPlanTable = ({
  weeklyPlan,
  dates,
  onMealChange,
  onDeleteSnack,
  onAddSnack,
  onDeleteWorkout,
  onAddWorkout,
  getDayName,
  formatDate,
}: WeeklyPlanTableProps) => {
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "snack" && onDeleteSnack) {
      onDeleteSnack(deleteConfirmation.date, deleteConfirmation.snackId || "");
    } else if (deleteConfirmation.type === "workout" && onDeleteWorkout) {
      onDeleteWorkout(deleteConfirmation.date, deleteConfirmation.workout!);
    }

    setDeleteConfirmation(null);
  };

  return (
    <>
      {/* Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete{" "}
                {deleteConfirmation.type === "snack" ? "Snack" : "Workout"}
              </h3>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {deleteConfirmation.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block overflow-x-auto -mx-4 px-4">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="p-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 w-[120px]">
                Meal
              </th>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                return (
                  <th
                    key={date}
                    className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 min-w-[140px]"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-xs">
                        {getDayName(date).slice(0, 3)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(date)}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Breakfast Row */}
            <tr className="border-b border-gray-200">
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                Breakfast
              </td>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                return (
                  <td key={date} className="p-3">
                    <TableMealItem
                      meal={dayData.meals.breakfast}
                      mealType="breakfast"
                      date={date}
                      onMealChange={(newMeal) =>
                        onMealChange(date, "breakfast", newMeal)
                      }
                    />
                  </td>
                );
              })}
            </tr>

            {/* Lunch Row */}
            <tr className="border-b border-gray-200">
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                Lunch
              </td>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                return (
                  <td key={date} className="p-3">
                    <TableMealItem
                      meal={dayData.meals.lunch}
                      mealType="lunch"
                      date={date}
                      onMealChange={(newMeal) =>
                        onMealChange(date, "lunch", newMeal)
                      }
                    />
                  </td>
                );
              })}
            </tr>

            {/* Dinner Row */}
            <tr className="border-b border-gray-200">
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                Dinner
              </td>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                return (
                  <td key={date} className="p-3">
                    <TableMealItem
                      meal={dayData.meals.dinner}
                      mealType="dinner"
                      date={date}
                      onMealChange={(newMeal) =>
                        onMealChange(date, "dinner", newMeal)
                      }
                    />
                  </td>
                );
              })}
            </tr>

            {/* Snacks Row */}
            <tr className="border-b border-gray-200">
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                Snacks
              </td>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                const firstSnack = dayData.meals.snacks?.[0];
                return (
                  <td key={date} className="p-3">
                    {firstSnack ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <TableMealItem
                              meal={firstSnack}
                              mealType="snacks"
                              date={date}
                              snackIndex={0}
                              onMealChange={(newMeal) =>
                                onMealChange(date, "snacks", newMeal)
                              }
                            />
                          </div>
                          {onDeleteSnack && (
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: "snack",
                                  date,
                                  snackId: firstSnack._id || "",
                                  name: firstSnack.name,
                                })
                              }
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition flex-shrink-0"
                              aria-label="Delete snack"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {dayData.meals.snacks.length > 1 && (
                          <div className="text-xs text-gray-500">
                            +{dayData.meals.snacks.length - 1} more
                          </div>
                        )}
                        {onAddSnack && (
                          <button
                            onClick={() => onAddSnack(date)}
                            className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded hover:border-green-500 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        {onAddSnack ? (
                          <button
                            onClick={() => onAddSnack(date)}
                            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded hover:border-green-500 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Snack</span>
                          </button>
                        ) : (
                          <div className="text-sm text-gray-500">No snacks</div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Workout Row */}
            <tr className="border-b border-gray-200">
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                Workout
              </td>
              {dates.slice(0, 5).map((date) => {
                const dayData = weeklyPlan[date];
                return (
                  <td key={date} className="p-3">
                    <div className="space-y-2">
                      {(() => {
                        const actualWorkouts = dayData.workouts.filter(
                          (w) => !w.name?.toLowerCase().includes("rest")
                        );
                        const hasOnlyRestDay =
                          dayData.workouts.length > 0 &&
                          actualWorkouts.length === 0;

                        if (hasOnlyRestDay || dayData.workouts.length === 0) {
                          return (
                            <div className="text-sm text-gray-500">
                              Rest Day
                            </div>
                          );
                        }

                        return actualWorkouts.map((workout, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {workout.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {workout.duration} min •{" "}
                                {workout.caloriesBurned} kcal
                              </div>
                            </div>
                            {onDeleteWorkout && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: "workout",
                                    date,
                                    workout,
                                    name: workout.name,
                                  })
                                }
                                className="text-red-500 hover:bg-red-50 p-1 rounded transition flex-shrink-0"
                                aria-label="Delete workout"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                      {onAddWorkout && (
                        <WorkoutModal
                          onWorkoutAdd={(workout) =>
                            onAddWorkout(date, workout)
                          }
                        >
                          <button className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded hover:border-green-500 transition">
                            <Plus className="w-3 h-3" />
                            <span>Add Workout</span>
                          </button>
                        </WorkoutModal>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Water Target Row */}
            <tr>
              <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
                <div className="flex items-center gap-2">
                  <GlassWater className="w-4 h-4 text-blue-500" />
                  <span>Water Target</span>
                </div>
              </td>
              {dates.slice(0, 5).map((date) => {
                return (
                  <td key={date} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded border border-blue-200 bg-blue-50 flex items-center justify-center"
                        >
                          <GlassWater className="w-3 h-3 text-blue-400" />
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">8 glasses</div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default WeeklyPlanTable;
