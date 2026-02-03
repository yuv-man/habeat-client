import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2,
  Plus,
  Scale,
  Dumbbell,
  GlassWater,
  Leaf,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import PlanSelector from "@/components/dashboard/PlanSelector";

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedDate?: string;
}

export interface ProgressEntry {
  date: string;
  value: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  icon: "run" | "weight" | "workout" | "water" | "veggies";
  status: "achieved" | "in_progress";
  startDate?: string;
  milestones?: Milestone[];
  progressHistory?: ProgressEntry[];
}

interface GoalsProps {
  goals?: Goal[];
  onUpdateProgress?: (goalId: string) => void;
  onMarkAchieved?: (goalId: string) => void;
  onAddGoal?: () => void;
  onDeleteGoal?: (goalId: string) => void;
}

const Goals = ({
  goals = [],
  onUpdateProgress: _onUpdateProgress,
  onMarkAchieved: _onMarkAchieved,
  onAddGoal,
  onDeleteGoal,
}: GoalsProps) => {
  // These callbacks are available for parent components to use if needed
  void _onUpdateProgress;
  void _onMarkAchieved;
  const navigate = useNavigate();
  const { plan, user, generateMealPlan } = useAuthStore();
  const deleteGoal = useGoalsStore((state) => state.deleteGoal);
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user has no plan
  const hasNoPlan =
    !plan || !plan.weeklyPlan || Object.keys(plan.weeklyPlan).length === 0;

  const handleDeleteClick = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;

    try {
      await deleteGoal(goalToDelete.id);
      if (onDeleteGoal) {
        onDeleteGoal(goalToDelete.id);
      }
      toast({
        title: "Goal deleted",
        description: "The goal has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const openPlanSelector = () => {
    setShowPlanSelector(true);
  };

  const handlePlanSelect = async (planTemplateId: string) => {
    if (!user) return;
    try {
      setIsGenerating(true);
      await generateMealPlan(
        user,
        "My Plan",
        "en",
        planTemplateId === "custom" ? undefined : planTemplateId
      );
      setShowPlanSelector(false);
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const getIcon = (iconType: Goal["icon"]) => {
    const iconClass = "w-6 h-6 text-white";
    switch (iconType) {
      case "run":
        return (
          <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
        );
      case "weight":
        return (
          <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
            <Scale className={iconClass} />
          </div>
        );
      case "workout":
        return (
          <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
            <Dumbbell className={iconClass} />
          </div>
        );
      case "water":
        return (
          <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
            <GlassWater className={iconClass} />
          </div>
        );
      case "veggies":
        return (
          <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
            <Leaf className={iconClass} />
          </div>
        );
      default:
        return null;
    }
  };

  const calculateProgressFromMilestones = (milestones?: Milestone[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const getProgressPercentage = (goal: Goal) => {
    // Use milestone-based progress if milestones exist, otherwise fallback to current/target
    if (goal.milestones && goal.milestones.length > 0) {
      return calculateProgressFromMilestones(goal.milestones);
    }
    // Fallback for goals without milestones
    if (goal.target > 0) {
      return Math.min((goal.current / goal.target) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* No Plan Banner */}
      {hasNoPlan && (
        <div className="mx-4 mt-4 bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-base mb-1">
                There is no plan. Please generate.
              </p>
              <p className="text-amber-700 text-sm mb-3">
                Create a meal plan to start tracking your nutrition goals.
              </p>
              <Button
                onClick={openPlanSelector}
                disabled={isGenerating}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 flex items-center gap-2"
                size="sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="px-4 py-6 space-y-4">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const isAchieved = goal.status === "achieved" || progress === 100;
          const completedMilestones =
            goal.milestones?.filter((m) => m.completed).length || 0;
          const totalMilestones = goal.milestones?.length || 0;

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/goals/${goal.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-3">
                {getIcon(goal.icon)}
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 text-lg mb-1">
                    {goal.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {goal.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDeleteClick(e, goal)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {totalMilestones > 0
                      ? `${completedMilestones}/${totalMilestones} milestones`
                      : `${progress}% complete`}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    isAchieved
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {isAchieved ? "Achieved" : "In Progress"}
                </span>
                <span className="text-xs text-gray-500">
                  Tap to view details
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onAddGoal}
        className="fixed bottom-24 right-4 w-14 h-14 bg-green-500 text-white hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{goalToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plan Selector Modal */}
      <PlanSelector
        open={showPlanSelector}
        onClose={() => setShowPlanSelector(false)}
        onSelect={handlePlanSelect}
        isGenerating={isGenerating}
        isRegeneration={
          !plan || Object.keys(plan.weeklyPlan || {}).length === 0
        }
      />
    </div>
  );
};

export default Goals;
