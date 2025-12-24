import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Goals from "@/components/goals/Goals";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Goal } from "@/components/goals/Goals";

const GoalsPage = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Run 5K",
      description: "Improve cardiovascular endurance and complete a 5K.",
      current: 3.5,
      target: 5,
      unit: "km",
      icon: "run",
      status: "achieved",
    },
    {
      id: "2",
      title: "Lose 10kg Weight",
      description: "Reach a healthier body weight through diet and consistent",
      current: 6.2,
      target: 10,
      unit: "kg",
      icon: "weight",
      status: "achieved",
    },
    {
      id: "3",
      title: "Workout 3x a Week",
      description:
        "Build strength and consistency in my weekly workout routine.",
      current: 2,
      target: 3,
      unit: "times",
      icon: "workout",
      status: "in_progress",
    },
    {
      id: "4",
      title: "Drink 2L Water Daily",
      description:
        "Stay adequately hydrated for better health and energy levels.",
      current: 1.8,
      target: 2,
      unit: "L",
      icon: "water",
      status: "achieved",
    },
    {
      id: "5",
      title: "Eat 5 Portions of Veggies",
      description: "Increase daily vegetable intake for improved nutrition.",
      current: 4,
      target: 5,
      unit: "portions",
      icon: "veggies",
      status: "achieved",
    },
  ]);

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  const handleUpdateProgress = (goalId: string) => {
    console.log("Update progress for goal:", goalId);
  };

  const handleMarkAchieved = (goalId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              status: goal.status === "achieved" ? "in_progress" : "achieved",
            }
          : goal
      )
    );
  };

  const handleAddGoal = () => {
    console.log("Add new goal");
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (loading) {
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
