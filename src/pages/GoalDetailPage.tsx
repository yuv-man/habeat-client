import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  TrendingUp,
  Calendar,
  Target,
  Scale,
  Dumbbell,
  GlassWater,
  Leaf,
  Edit2,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Types
interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedDate?: string;
}

interface ProgressEntry {
  date: string;
  value: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  icon: "run" | "weight" | "workout" | "water" | "veggies";
  status: "achieved" | "in_progress";
  startDate: string;
  milestones: Milestone[];
  progressHistory: ProgressEntry[];
}

// Mock data - in real app, this would come from API/store
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Run 5K",
    description: "Improve cardiovascular endurance and complete a 5K.",
    current: 3.5,
    target: 5,
    unit: "km",
    icon: "run",
    status: "achieved",
    startDate: "2024-11-01",
    milestones: [
      { id: "m1", title: "Run 1K without stopping", targetValue: 1, completed: true, completedDate: "2024-11-10" },
      { id: "m2", title: "Run 2K in under 15 min", targetValue: 2, completed: true, completedDate: "2024-11-20" },
      { id: "m3", title: "Run 3K comfortably", targetValue: 3, completed: true, completedDate: "2024-12-01" },
      { id: "m4", title: "Complete 5K run", targetValue: 5, completed: false },
    ],
    progressHistory: [
      { date: "2024-11-01", value: 0.5 },
      { date: "2024-11-08", value: 1.0 },
      { date: "2024-11-15", value: 1.5 },
      { date: "2024-11-22", value: 2.2 },
      { date: "2024-11-29", value: 2.8 },
      { date: "2024-12-06", value: 3.2 },
      { date: "2024-12-13", value: 3.5 },
    ],
  },
  {
    id: "2",
    title: "Lose 10kg Weight",
    description: "Reach a healthier body weight through diet and consistent exercise.",
    current: 6.2,
    target: 10,
    unit: "kg",
    icon: "weight",
    status: "achieved",
    startDate: "2024-10-01",
    milestones: [
      { id: "m1", title: "Lose first 2kg", targetValue: 2, completed: true, completedDate: "2024-10-15" },
      { id: "m2", title: "Lose 5kg (halfway)", targetValue: 5, completed: true, completedDate: "2024-11-10" },
      { id: "m3", title: "Lose 7.5kg (75%)", targetValue: 7.5, completed: false },
      { id: "m4", title: "Reach goal: 10kg lost", targetValue: 10, completed: false },
    ],
    progressHistory: [
      { date: "2024-10-01", value: 0 },
      { date: "2024-10-15", value: 2.1 },
      { date: "2024-11-01", value: 3.5 },
      { date: "2024-11-15", value: 4.8 },
      { date: "2024-12-01", value: 5.6 },
      { date: "2024-12-15", value: 6.2 },
    ],
  },
  {
    id: "3",
    title: "Workout 3x a Week",
    description: "Build strength and consistency in my weekly workout routine.",
    current: 2,
    target: 3,
    unit: "times",
    icon: "workout",
    status: "in_progress",
    startDate: "2024-12-01",
    milestones: [
      { id: "m1", title: "Complete first week", targetValue: 1, completed: true, completedDate: "2024-12-07" },
      { id: "m2", title: "2 weeks streak", targetValue: 2, completed: true, completedDate: "2024-12-14" },
      { id: "m3", title: "1 month consistency", targetValue: 4, completed: false },
      { id: "m4", title: "2 months streak", targetValue: 8, completed: false },
    ],
    progressHistory: [
      { date: "2024-12-01", value: 0 },
      { date: "2024-12-07", value: 2 },
      { date: "2024-12-14", value: 2 },
      { date: "2024-12-21", value: 2 },
    ],
  },
  {
    id: "4",
    title: "Drink 2L Water Daily",
    description: "Stay adequately hydrated for better health and energy levels.",
    current: 1.8,
    target: 2,
    unit: "L",
    icon: "water",
    status: "achieved",
    startDate: "2024-12-01",
    milestones: [
      { id: "m1", title: "Drink 1L daily for a week", targetValue: 1, completed: true, completedDate: "2024-12-07" },
      { id: "m2", title: "Reach 1.5L daily", targetValue: 1.5, completed: true, completedDate: "2024-12-14" },
      { id: "m3", title: "Consistent 2L for a week", targetValue: 2, completed: false },
    ],
    progressHistory: [
      { date: "2024-12-01", value: 0.8 },
      { date: "2024-12-07", value: 1.2 },
      { date: "2024-12-14", value: 1.5 },
      { date: "2024-12-21", value: 1.8 },
    ],
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
    startDate: "2024-11-15",
    milestones: [
      { id: "m1", title: "Eat 2 portions daily", targetValue: 2, completed: true, completedDate: "2024-11-22" },
      { id: "m2", title: "Eat 3 portions daily", targetValue: 3, completed: true, completedDate: "2024-12-01" },
      { id: "m3", title: "Eat 4 portions daily", targetValue: 4, completed: true, completedDate: "2024-12-10" },
      { id: "m4", title: "Reach 5 portions goal", targetValue: 5, completed: false },
    ],
    progressHistory: [
      { date: "2024-11-15", value: 1 },
      { date: "2024-11-22", value: 2 },
      { date: "2024-12-01", value: 3 },
      { date: "2024-12-08", value: 3.5 },
      { date: "2024-12-15", value: 4 },
    ],
  },
];

const GoalDetailPage = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", targetValue: "" });
  const [newProgress, setNewProgress] = useState("");

  useEffect(() => {
    // In real app, fetch from API
    const foundGoal = mockGoals.find((g) => g.id === goalId);
    if (foundGoal) {
      setGoal(foundGoal);
    }
  }, [goalId]);

  const getIcon = (iconType: Goal["icon"]) => {
    const iconClass = "w-8 h-8 text-white";
    const containerClass = "w-16 h-16 rounded-2xl flex items-center justify-center";
    switch (iconType) {
      case "run":
        return (
          <div className={`${containerClass} bg-green-400`}>
            <span className="text-white font-bold text-2xl">H</span>
          </div>
        );
      case "weight":
        return (
          <div className={`${containerClass} bg-orange-400`}>
            <Scale className={iconClass} />
          </div>
        );
      case "workout":
        return (
          <div className={`${containerClass} bg-blue-400`}>
            <Dumbbell className={iconClass} />
          </div>
        );
      case "water":
        return (
          <div className={`${containerClass} bg-yellow-400`}>
            <GlassWater className={iconClass} />
          </div>
        );
      case "veggies":
        return (
          <div className={`${containerClass} bg-green-400`}>
            <Leaf className={iconClass} />
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleAddMilestone = () => {
    if (!goal || !newMilestone.title || !newMilestone.targetValue) return;

    const milestone: Milestone = {
      id: `m${Date.now()}`,
      title: newMilestone.title,
      targetValue: parseFloat(newMilestone.targetValue),
      completed: false,
    };

    setGoal({
      ...goal,
      milestones: [...goal.milestones, milestone].sort(
        (a, b) => a.targetValue - b.targetValue
      ),
    });
    setNewMilestone({ title: "", targetValue: "" });
    setShowAddMilestone(false);
  };

  const toggleMilestone = (milestoneId: string) => {
    if (!goal) return;

    setGoal({
      ...goal,
      milestones: goal.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: !m.completed,
              completedDate: !m.completed
                ? new Date().toISOString().split("T")[0]
                : undefined,
            }
          : m
      ),
    });
  };

  const deleteMilestone = (milestoneId: string) => {
    if (!goal) return;

    setGoal({
      ...goal,
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    });
  };

  const handleUpdateProgress = () => {
    if (!goal || !newProgress) return;

    const newValue = parseFloat(newProgress);
    const today = new Date().toISOString().split("T")[0];

    setGoal({
      ...goal,
      current: newValue,
      progressHistory: [
        ...goal.progressHistory.filter((p) => p.date !== today),
        { date: today, value: newValue },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    });
    setNewProgress("");
    setShowUpdateProgress(false);
  };

  // Calculate chart dimensions
  const getChartPath = () => {
    if (!goal || goal.progressHistory.length < 2) return "";

    const maxValue = Math.max(goal.target, ...goal.progressHistory.map((p) => p.value));
    const width = 100;
    const height = 100;
    const padding = 10;

    const points = goal.progressHistory.map((entry, index) => {
      const x = padding + (index / (goal.progressHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - (entry.value / maxValue) * (height - 2 * padding);
      return { x, y };
    });

    const path = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    return path;
  };

  if (!goal) {
    return (
      <DashboardLayout bgColor="bg-gray-50" showNavBar={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Goal not found</div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = getProgressPercentage(goal.current, goal.target);
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  return (
    <DashboardLayout bgColor="bg-gray-50" showNavBar={false}>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-14 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/goals")}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Goal Details</h1>
          </div>
        </div>

        {/* Goal Overview Card */}
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              {getIcon(goal.icon)}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{goal.title}</h2>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={goal.status === "achieved" ? "#22c55e" : "#f97316"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 3.52} 352`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {goal.current}
                  </span>
                  <span className="text-sm text-gray-500">of {goal.target} {goal.unit}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                <div className="text-xs text-gray-500">Started</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatDate(goal.startDate)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Target className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                <div className="text-xs text-gray-500">Milestones</div>
                <div className="text-sm font-semibold text-gray-900">
                  {completedMilestones}/{goal.milestones.length}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-sm font-semibold text-gray-900">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Update Progress Button */}
            <button
              onClick={() => setShowUpdateProgress(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition"
            >
              Update Progress
            </button>
          </div>
        </div>

        {/* Progress History Chart */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Progress Over Time
            </h3>
            
            {goal.progressHistory.length > 1 ? (
              <div className="relative h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="10" y1="90" x2="90" y2="90" stroke="#e5e7eb" strokeWidth="0.5" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="10" y1="10" x2="90" y2="10" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  
                  {/* Progress line */}
                  <path
                    d={getChartPath()}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {goal.progressHistory.map((entry, index) => {
                    const maxValue = Math.max(goal.target, ...goal.progressHistory.map((p) => p.value));
                    const x = 10 + (index / (goal.progressHistory.length - 1)) * 80;
                    const y = 90 - (entry.value / maxValue) * 80;
                    return (
                      <circle
                        key={entry.date}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="#22c55e"
                      />
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(goal.progressHistory[0].date)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(goal.progressHistory[goal.progressHistory.length - 1].date)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                Add more progress entries to see the chart
              </div>
            )}

            {/* Recent Progress List */}
            <div className="mt-4 space-y-2">
              {goal.progressHistory.slice(-5).reverse().map((entry) => (
                <div
                  key={entry.date}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600">{formatDate(entry.date)}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.value} {goal.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Milestones
              </h3>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                    milestone.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                      milestone.completed
                        ? "bg-green-500 text-white"
                        : "border-2 border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {milestone.completed && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm ${
                        milestone.completed ? "text-green-700" : "text-gray-900"
                      }`}
                    >
                      {milestone.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {milestone.targetValue} {goal.unit}
                      {milestone.completedDate && (
                        <span> • Completed {formatDate(milestone.completedDate)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="p-1.5 hover:bg-red-100 rounded-full transition text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {goal.milestones.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No milestones yet. Add one to track your progress!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Milestone Modal */}
        {showAddMilestone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Milestone</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, title: e.target.value })
                    }
                    placeholder="e.g., Complete first 2km"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value ({goal.unit})
                  </label>
                  <input
                    type="number"
                    value={newMilestone.targetValue}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, targetValue: e.target.value })
                    }
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Progress Modal */}
        {showUpdateProgress && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Progress</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Progress ({goal.unit})
                </label>
                <input
                  type="number"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  placeholder={`e.g., ${goal.current}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Previous: {goal.current} {goal.unit} • Target: {goal.target} {goal.unit}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUpdateProgress(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProgress}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GoalDetailPage;

