import { useNavigate } from "react-router-dom";
import {
  Share2,
  Plus,
  Scale,
  Dumbbell,
  GlassWater,
  Leaf,
  ChevronRight,
} from "lucide-react";

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
}

const Goals = ({
  goals = [],
  onUpdateProgress: _onUpdateProgress,
  onMarkAchieved: _onMarkAchieved,
  onAddGoal,
}: GoalsProps) => {
  // These callbacks are available for parent components to use if needed
  void _onUpdateProgress;
  void _onMarkAchieved;
  const navigate = useNavigate();
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

      {/* Goals List */}
      <div className="px-4 py-6 space-y-4">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const isAchieved = goal.status === "achieved" || progress === 100;
          const completedMilestones = goal.milestones?.filter((m) => m.completed).length || 0;
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
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {goal.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
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
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-500 text-white hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Goals;
