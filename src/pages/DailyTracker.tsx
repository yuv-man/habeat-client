import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import DailyMealScreen from "@/components/dashboard/DailyMealScreen";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your daily tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout currentView="daily">
      <DailyMealScreen />
    </DashboardLayout>
  );
};

export default DailyTracker;
