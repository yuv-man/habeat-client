import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import WeeklyMealPlan from "@/components/dashboard/weeklyPlan";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";

const weeklyPlanLoadingMessages = [
  "🍽️ Our AI nutritionist is creating your meal plan...",
  "🍎 Balancing your nutrients...",
  "🍳 adding your favorite meals...",
  "🏋️‍♂️ adding some workouts...",
  "🍽️ Plating your weekly plan...",
];

const WeeklyOverview = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MealLoader
          customMessages={weeklyPlanLoadingMessages}
          interval={2000}
        />
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout currentView="weekly">
      <WeeklyMealPlan />
    </DashboardLayout>
  );
};

export default WeeklyOverview;
