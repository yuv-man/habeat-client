import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import { IAnalyticsData } from "@/types/interfaces";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  Flame,
  Droplets,
  Dumbbell,
  Calendar,
  Target,
  Award,
  ArrowLeft,
} from "lucide-react";
import MealLoader from "@/components/helper/MealLoader";
import { EngagementCard } from "@/components/engagement";
import { ChallengeList } from "@/components/challenges";
import { DailySummaryCard } from "@/components/reflection";

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [analytics, setAnalytics] = useState<IAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await userAPI.getAnalytics(user._id, period);
        setAnalytics(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?._id, period]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return "text-green-500";
    if (percentage >= 70 && percentage <= 130) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return "bg-green-500";
    if (percentage >= 70 && percentage <= 130) return "bg-yellow-500";
    return "bg-red-500";
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    target,
    color,
    percentage,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    target?: number;
    color: string;
    percentage?: number;
  }) => {
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
        {target !== undefined && percentage !== undefined && (
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
                className={`h-1.5 rounded-full transition-all ${getProgressBgColor(
                  percentage
                )}`}
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
        <MealLoader customMessages={["Loading your analytics..."]} />
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Progress</h1>
              <p className="text-sm text-gray-500">
                {period === "week" ? "Last 7 days" : "Last 30 days"}
              </p>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === "week"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === "month"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <MealLoader />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Analytics Content */}
        {!isLoading && !error && analytics && (
          <>
            {/* Engagement Card */}
            <EngagementCard className="mb-6" />

            {/* Challenges */}
            <ChallengeList className="mb-6" />

            {/* Daily Summary Card */}
            <DailySummaryCard className="mb-6" showDismiss={false} />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="col-span-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Daily Average</p>
                    <p className="text-3xl font-bold">
                      {analytics.averages.calories.toLocaleString()}
                    </p>
                    <p className="text-green-100 text-sm">calories/day</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-100">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {analytics.daysTracked} of {analytics.totalDays} days
                        tracked
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-100 mt-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">
                        Target: {analytics.targets.calories}/day
                      </span>
                    </div>
                    {analytics.totals.caloriesBurned > 0 && (
                      <div className="flex items-center gap-1 text-green-100 mt-1">
                        <Dumbbell className="w-4 h-4" />
                        <span className="text-sm">
                          {analytics.totals.caloriesBurned} cal burned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <StatCard
                icon={Flame}
                label="Total Calories"
                value={analytics.totals.calories}
                unit="kcal"
                target={analytics.targets.calories * analytics.daysTracked}
                percentage={analytics.goalPercentages.calories}
                color="bg-orange-500"
              />
              <StatCard
                icon={Award}
                label="Avg Protein"
                value={analytics.averages.protein}
                unit="g/day"
                target={analytics.targets.protein}
                percentage={analytics.goalPercentages.protein}
                color="bg-blue-500"
              />
              <StatCard
                icon={Droplets}
                label="Avg Water"
                value={analytics.averages.water}
                unit="glasses/day"
                target={analytics.targets.water}
                percentage={analytics.goalPercentages.water}
                color="bg-cyan-500"
              />
              <StatCard
                icon={Dumbbell}
                label="Workouts"
                value={analytics.totals.workoutsCompleted}
                unit={`of ${analytics.totals.workoutsTotal}`}
                color="bg-purple-500"
              />
            </div>

            {/* Macro Breakdown */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Daily Macro Averages
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Protein",
                    value: analytics.averages.protein,
                    target: analytics.targets.protein,
                    percentage: analytics.goalPercentages.protein,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Carbs",
                    value: analytics.averages.carbs,
                    target: analytics.targets.carbs,
                    percentage: analytics.goalPercentages.carbs,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Fat",
                    value: analytics.averages.fat,
                    target: analytics.targets.fat,
                    percentage: analytics.goalPercentages.fat,
                    color: "bg-pink-500",
                  },
                ].map((macro) => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{macro.label}</span>
                      <span className="text-gray-900 font-medium">
                        {macro.value}g / {macro.target}g ({macro.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${macro.color}`}
                        style={{ width: `${Math.min(macro.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Breakdown */}
            {analytics.dailyData.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Daily Breakdown
                </h2>
                <div className="space-y-3">
                  {analytics.dailyData.map((day) => {
                    const dayDate = new Date(day.date);
                    const dayName = dayDate.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                    const dayNum = dayDate.getDate();
                    const month = dayDate.toLocaleDateString("en-US", {
                      month: "short",
                    });
                    const caloriePercentage =
                      day.caloriesGoal > 0
                        ? Math.round((day.calories / day.caloriesGoal) * 100)
                        : 0;

                    return (
                      <div
                        key={day.dateKey}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-center min-w-[50px]">
                          <p className="text-xs text-gray-500">{dayName}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {dayNum}
                          </p>
                          <p className="text-xs text-gray-500">{month}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Calories</span>
                            <span
                              className={`font-medium ${getProgressColor(
                                caloriePercentage
                              )}`}
                            >
                              {day.calories} / {day.caloriesGoal}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressBgColor(
                                caloriePercentage
                              )}`}
                              style={{
                                width: `${Math.min(caloriePercentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>P: {day.protein}g</span>
                            <span>C: {day.carbs}g</span>
                            <span>F: {day.fat}g</span>
                            <span>💧 {day.water}</span>
                            {day.workoutsCompleted > 0 && (
                              <span>💪 {day.workoutsCompleted}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {analytics.daysTracked === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Data Yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Start tracking your meals and workouts to see your progress
                  here.
                </p>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h3 className="font-semibold text-green-800 mb-2">
                Tips for Success
              </h3>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Track your meals consistently for accurate insights</li>
                <li>
                  • Aim for {analytics.targets.water} glasses of water daily
                </li>
                <li>• Balance your macros for optimal nutrition</li>
                <li>• Complete your planned workouts to burn extra calories</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
