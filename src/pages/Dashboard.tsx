import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import DailyMealScreen from "@/components/dashboard/DailyMealScreen";
import { paths } from "@/lib/paths";
import NavBar from "@/components/ui/navbar";
import Loader from "@/components/helper/loader";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, plan, loading } = useAuthStore();
  const [dailyProgress, setDailyProgress] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'daily' | 'weekly'>('daily');

  const weeklyProgress = 75;
  const streak = 7;

  

  useEffect(() => {
    if (!loading && !user) {
      navigate('/register');
    }
  }, [user, loading, navigate]);

  // if (loading) {
  //   return <Loader />;
  // }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (isProgressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your daily progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar currentView={currentView} onViewChange={setCurrentView} />
      {/* Content */}
      {currentView === 'daily' ? (
        <DailyMealScreen />
      ) : (
        <WeeklyOverview />
      )}
    </div>
  );
};

export default Dashboard;