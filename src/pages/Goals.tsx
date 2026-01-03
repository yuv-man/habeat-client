import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useGoalsStore } from "@/stores/goalsStore";
import Goals from "@/components/goals/Goals";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";

const GoalsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, token } = useAuthStore();
  const {
    goals,
    loading: goalsLoading,
    fetchGoals,
    markAchieved,
  } = useGoalsStore();

  useEffect(() => {
    if (!authLoading && !user && !token) {
      navigate("/register");
    }
  }, [user, authLoading, token, navigate]);

  // Fetch goals when user is available
  useEffect(() => {
    if (user?._id) {
      fetchGoals(user._id);
    }
  }, [user?._id, fetchGoals]);

  const handleUpdateProgress = (goalId: string) => {
    if (user?._id) {
      // Navigate to goal detail page for updating
      navigate(`/goals/${goalId}`);
    }
  };

  const handleMarkAchieved = (goalId: string) => {
    markAchieved(goalId);
  };

  const handleAddGoal = () => {
    // Navigate to create goal page
    navigate("/goals/create");
  };

  const handleDeleteGoal = async (_goalId: string) => {
    // Refresh goals list after deletion to ensure sync
    if (user?._id) {
      await fetchGoals(user._id);
    }
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (authLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MealLoader customMessages={["Loading your goals..."]} />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout bgColor="bg-white" showNavBar={true} hidePlanBanner={true}>
      <Goals
        goals={goals}
        onUpdateProgress={handleUpdateProgress}
        onMarkAchieved={handleMarkAchieved}
        onAddGoal={handleAddGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </DashboardLayout>
  );
};

export default GoalsPage;
