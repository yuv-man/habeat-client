import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  Flame,
  Droplets,
  Dumbbell,
  Calendar,
  Target,
  Award,
} from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();
  const { user, plan, loading, token } = useAuthStore();

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  // Calculate weekly stats from plan
  const weeklyStats = useMemo(() => {
    if (!plan?.weeklyPlan) {
      return {
        totalCalories: 0,
        avgCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalWater: 0,
        totalWorkouts: 0,
        daysTracked: 0,
      };
    }

    const days = Object.values(plan.weeklyPlan);
    const daysTracked = days.length;

    const totals = days.reduce(
      (acc, day) => ({
        calories: acc.calories + (day.totalCalories || 0),
        protein: acc.protein + (day.totalProtein || 0),
        carbs: acc.carbs + (day.totalCarbs || 0),
        fat: acc.fat + (day.totalFat || 0),
        water: acc.water + (day.waterIntake || 0),
        workouts: acc.workouts + (day.workouts?.length || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, workouts: 0 }
    );

    return {
      totalCalories: totals.calories,
      avgCalories:
        daysTracked > 0 ? Math.round(totals.calories / daysTracked) : 0,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalWater: totals.water,
      totalWorkouts: totals.workouts,
      daysTracked,
    };
  }, [plan]);

  // Calculate target vs actual
  const targetCalories = plan?.userMetrics?.targetCalories || 2000;
  const targetProtein = plan?.userMetrics?.dailyMacros?.protein || 150;
  const targetCarbs = plan?.userMetrics?.dailyMacros?.carbs || 250;
  const targetFat = plan?.userMetrics?.dailyMacros?.fat || 65;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return "text-green-500";
    if (percentage >= 70 && percentage <= 130) return "text-yellow-500";
    return "text-red-500";
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    target,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    target?: number;
    color: string;
  }) => {
    const percentage = target ? Math.round((value / target) * 100) : null;

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
        {target && percentage !== null && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">
                Target: {target.toLocaleString()}
              </span>
              <span className={getProgressColor(percentage)}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  percentage >= 90 && percentage <= 110
                    ? "bg-green-500"
                    : percentage >= 70 && percentage <= 130
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout currentView="weekly">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-sm text-gray-500">Weekly nutrition overview</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="col-span-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Weekly Average</p>
                <p className="text-3xl font-bold">
                  {weeklyStats.avgCalories.toLocaleString()}
                </p>
                <p className="text-green-100 text-sm">calories/day</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {weeklyStats.daysTracked} days tracked
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-100 mt-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Target: {targetCalories}/day</span>
                </div>
              </div>
            </div>
          </div>

          <StatCard
            icon={Flame}
            label="Total Calories"
            value={weeklyStats.totalCalories}
            unit="kcal"
            target={targetCalories * weeklyStats.daysTracked}
            color="bg-orange-500"
          />
          <StatCard
            icon={Award}
            label="Protein"
            value={weeklyStats.totalProtein}
            unit="g"
            target={targetProtein * weeklyStats.daysTracked}
            color="bg-blue-500"
          />
          <StatCard
            icon={Droplets}
            label="Water Intake"
            value={weeklyStats.totalWater}
            unit="glasses"
            target={8 * weeklyStats.daysTracked}
            color="bg-cyan-500"
          />
          <StatCard
            icon={Dumbbell}
            label="Workouts"
            value={weeklyStats.totalWorkouts}
            unit="sessions"
            color="bg-purple-500"
          />
        </div>

        {/* Macro Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Macro Breakdown</h2>
          <div className="space-y-4">
            {[
              {
                label: "Protein",
                value: weeklyStats.totalProtein,
                target: targetProtein * weeklyStats.daysTracked,
                color: "bg-blue-500",
              },
              {
                label: "Carbs",
                value: weeklyStats.totalCarbs,
                target: targetCarbs * weeklyStats.daysTracked,
                color: "bg-amber-500",
              },
              {
                label: "Fat",
                value: weeklyStats.totalFat,
                target: targetFat * weeklyStats.daysTracked,
                color: "bg-pink-500",
              },
            ].map((macro) => {
              const percentage =
                macro.target > 0
                  ? Math.round((macro.value / macro.target) * 100)
                  : 0;
              return (
                <div key={macro.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{macro.label}</span>
                    <span className="text-gray-900 font-medium">
                      {macro.value}g / {macro.target}g ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${macro.color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2">
            💡 Tips for Success
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Track your meals consistently for accurate insights</li>
            <li>• Aim for 8 glasses of water daily</li>
            <li>• Balance your macros for optimal nutrition</li>
            <li>• Include regular workouts in your routine</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
