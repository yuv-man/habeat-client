import { GlassWater, Plus, Trash2 } from "lucide-react";
import { IDailyPlan, IMeal, WorkoutData } from "@/types/interfaces";
import TableMealItem from "./TableMealItem";
import WorkoutModal from "@/components/modals/WorkoutModal";

interface WeeklyPlanTableProps {
  weeklyPlan: { [date: string]: IDailyPlan };
  dates: string[];
  onMealClick: (meal: IMeal, mealType: string) => void;
  onDeleteSnack?: (date: string, snackId: string) => void;
  onAddSnack?: (date: string) => void;
  onDeleteWorkout?: (date: string, workoutIndex: number) => void;
  onAddWorkout?: (date: string, workout: WorkoutData) => void;
  getDayName: (dateStr: string) => string;
  formatDate: (dateStr: string) => string;
}

const WeeklyPlanTable = ({
  weeklyPlan,
  dates,
  onMealClick,
  onDeleteSnack,
  onAddSnack,
  onDeleteWorkout,
  onAddWorkout,
  getDayName,
  formatDate,
}: WeeklyPlanTableProps) => {
  return (
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
                    onSwap={() =>
                      onMealClick(dayData.meals.breakfast, "breakfast")
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
                    onSwap={() => onMealClick(dayData.meals.lunch, "lunch")}
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
                    onSwap={() => onMealClick(dayData.meals.dinner, "dinner")}
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
                            onSwap={() => onMealClick(firstSnack, "snacks")}
                          />
                        </div>
                        {onDeleteSnack && (
                          <button
                            onClick={() =>
                              onDeleteSnack(date, firstSnack._id || "")
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
                    {dayData.workouts.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {dayData.workouts[0].name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dayData.workouts[0].duration} min •{" "}
                            {dayData.workouts[0].caloriesBurned} kcal
                          </div>
                        </div>
                        {onDeleteWorkout && (
                          <button
                            onClick={() => onDeleteWorkout(date, 0)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition flex-shrink-0"
                            aria-label="Delete workout"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Rest Day</div>
                    )}
                    {onAddWorkout && (
                      <WorkoutModal
                        onWorkoutAdd={(workout) => onAddWorkout(date, workout)}
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

          {/* Water Intake Row */}
          <tr>
            <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50">
              <div className="flex items-center gap-2">
                <GlassWater className="w-4 h-4 text-blue-500" />
                <span>Water Intake</span>
              </div>
            </td>
            {dates.slice(0, 5).map((date) => {
              const dayData = weeklyPlan[date];
              return (
                <td key={date} className="p-3">
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(dayData.waterIntake / 8) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {dayData.waterIntake} / 8 glasses
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyPlanTable;
