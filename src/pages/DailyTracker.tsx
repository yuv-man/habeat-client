import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import DailyMealScreen from "@/components/dashboard/DailyMealScreen";
import NavBar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/BottomNav";
import MobileHeader from "@/components/ui/MobileHeader";

const DailyTracker = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/register");
    }
  }, [user, loading, navigate]);

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your daily tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-16 pb-20 md:pb-0">
      <MobileHeader />
      <NavBar
        currentView="daily"
        onViewChange={(view) => {
          if (view === "weekly") {
            navigate("/weekly-overview");
          }
        }}
      />
      {/* Content */}
      <DailyMealScreen />
      <BottomNav />
    </div>
  );
};

export default DailyTracker;
