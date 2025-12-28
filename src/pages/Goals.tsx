import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useGoalsStore } from "@/stores/goalsStore";
import Goals from "@/components/goals/Goals";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
    if (user?._id) {
      markAchieved(user._id, goalId);
    }
  };

  const handleAddGoal = () => {
    // TODO: Open add goal modal
    console.log("Add new goal");
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (authLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout bgColor="bg-white" showNavBar={true}>
      <Goals
        goals={goals}
        onUpdateProgress={handleUpdateProgress}
        onMarkAchieved={handleMarkAchieved}
        onAddGoal={handleAddGoal}
      />
    </DashboardLayout>
  );
};

export default GoalsPage;
