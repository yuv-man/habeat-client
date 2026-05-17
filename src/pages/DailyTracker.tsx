import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import DailyMealScreen from "@/components/dashboard/DailyMealScreen";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import WatchStatusBadge from "@/components/watch/WatchStatusBadge";

const DailyTracker = () => {
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
        <div className="text-center">
          <MealLoader customMessages={["Loading your daily tracker..."]} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout currentView="daily">
      <WatchStatusBadge />
      <DailyMealScreen />
    </DashboardLayout>
  );
};

export default DailyTracker;
