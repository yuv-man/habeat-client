import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  Calendar,
  Target,
  Trash2,
  FileText,
  Trophy,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGoalsStore } from "@/stores/goalsStore";
import { useAuthStore } from "@/stores/authStore";
import MealLoader from "@/components/helper/MealLoader";
import { getGoalConfig } from "@/lib/goalTypes";
import type { Goal, Milestone } from "@/components/goals/Goals";

const GoalDetailPage = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    goals,
    fetchGoals,
    updateGoal,
    updateMilestone: storeMilestoneUpdate,
  } = useGoalsStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
  });
  const [progressNote, setProgressNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?._id && goals.length === 0) {
      fetchGoals(user._id);
    }
  }, [user?._id, goals.length, fetchGoals]);

  useEffect(() => {
    const storeGoal = goals.find((g) => g.id === goalId);
    if (storeGoal) {
      setGoal({
        ...storeGoal,
        startDate:
          storeGoal.startDate || new Date().toISOString().split("T")[0],
        milestones: storeGoal.milestones || [],
        progressHistory: storeGoal.progressHistory || [],
      } as Goal);
    }
  }, [goals, goalId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (milestones: Milestone[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const handleAddMilestone = () => {
    if (!goal || !newMilestone.title.trim()) return;

    const currentMilestones = goal.milestones || [];
    const newMilestoneCount = currentMilestones.length + 1;

    const milestone: Milestone = {
      id: `m${Date.now()}`,
      title: newMilestone.title.trim(),
      targetValue: 0, // Will be recalculated below
      completed: false,
    };

    // Recalculate percentages for all milestones to ensure they're sequential
    // Each milestone represents a step: 1st = 33%, 2nd = 67%, 3rd = 100% (for 3 milestones)
    const updatedMilestones = [...currentMilestones, milestone].map(
      (m, index) => ({
        ...m,
        targetValue: Math.round(((index + 1) / newMilestoneCount) * 100),
      })
    );

    setGoal({ ...goal, milestones: updatedMilestones });
    updateGoal(goal.id, { milestones: updatedMilestones } as any);
    setNewMilestone({ title: "" });
    setShowAddMilestone(false);
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!goal) return;

    const milestones = goal.milestones || [];
    const milestoneIndex = milestones.findIndex((m) => m.id === milestoneId);
    const milestone = milestones[milestoneIndex];

    if (!milestone) return;

    const newCompleted = !milestone.completed;

    // If trying to complete a milestone, check if all previous milestones are completed
    if (newCompleted && milestoneIndex > 0) {
      const previousMilestones = milestones.slice(0, milestoneIndex);
      const allPreviousCompleted = previousMilestones.every((m) => m.completed);

      if (!allPreviousCompleted) {
        alert("Please complete previous milestones first");
        return;
      }
    }

    // If uncompleting a milestone, also uncomplete all subsequent milestones
    const updatedMilestones = milestones.map((m, index) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          completed: newCompleted,
          completedDate: newCompleted
            ? new Date().toISOString().split("T")[0]
            : undefined,
        };
      }
      // Uncomplete all milestones after this one if we're uncompleting
      if (!newCompleted && index > milestoneIndex && m.completed) {
        return {
          ...m,
          completed: false,
          completedDate: undefined,
        };
      }
      return m;
    });

    const newProgress = calculateProgress(updatedMilestones);
    setGoal({ ...goal, milestones: updatedMilestones, current: newProgress });

    try {
      // Update all changed milestones
      for (let i = milestoneIndex; i < updatedMilestones.length; i++) {
        const m = updatedMilestones[i];
        const originalM = milestones[i];
        if (m.completed !== originalM.completed) {
          await storeMilestoneUpdate(goal.id, m.id, m.completed);
        }
      }
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  const deleteMilestone = (milestoneId: string) => {
    if (!goal) return;

    const milestones = goal.milestones || [];
    const updatedMilestones = milestones.filter((m) => m.id !== milestoneId);

    // Recalculate percentages for remaining milestones
    const recalculatedMilestones = updatedMilestones.map((m, index) => ({
      ...m,
      targetValue:
        updatedMilestones.length > 0
          ? Math.round(((index + 1) / updatedMilestones.length) * 100)
          : 0,
    }));

    setGoal({
      ...goal,
      milestones: recalculatedMilestones,
      current: calculateProgress(recalculatedMilestones),
    });
    updateGoal(goal.id, { milestones: recalculatedMilestones } as any);
  };

  const handleSaveNote = async () => {
    if (!goal || !progressNote.trim()) return;

    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const progress = calculateProgress(goal.milestones || []);

    const newEntry = {
      date: today,
      value: progress,
      note: progressNote.trim(),
    };
    const updatedHistory = [
      ...(goal.progressHistory || []).filter((p) => p.date !== today),
      newEntry,
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setGoal({ ...goal, progressHistory: updatedHistory });

    try {
      await updateGoal(goal.id, { progressHistory: updatedHistory } as any);
      setProgressNote("");
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
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

  const config = getGoalConfig(goal.icon);
  const GoalIcon = config.icon;
  const milestones = goal.milestones || [];
  const progressHistory = goal.progressHistory || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progress = calculateProgress(milestones);
  const isComplete = progress === 100;

  return (
    <DashboardLayout bgColor="bg-gray-100" showNavBar={false}>
      <div className="min-h-screen pb-24">
        {/* Hero Header with Gradient */}
        <div
          className={`bg-gradient-to-br ${config.gradient} px-4 pt-4 pb-32 relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/goals")}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              {isComplete && (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400 rounded-full">
                  <Trophy className="w-4 h-4 text-yellow-900" />
                  <span className="text-xs font-bold text-yellow-900">
                    ACHIEVED!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Goal Info */}
          <div className="relative text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
              <GoalIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{goal.title}</h1>
            <p className="text-white/80 text-sm max-w-xs mx-auto">
              {goal.description}
            </p>
          </div>
        </div>

        {/* Progress Card - Overlapping */}
        <div className="px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            {/* Progress Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="14"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    fill="none"
                    stroke={isComplete ? "#22c55e" : "url(#progressGradient)"}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 3.89} 389`}
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient
                      id="progressGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900">
                    {progress}%
                  </span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className={`text-center p-3 ${config.lightBg} rounded-2xl`}>
                <Calendar className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Started
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatDate(goal.startDate || new Date().toISOString())}
                </div>
              </div>
              <div className={`text-center p-3 ${config.lightBg} rounded-2xl`}>
                <Target className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Milestones
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {completedMilestones}/{milestones.length}
                </div>
              </div>
              <div
                className={`text-center p-3 rounded-2xl ${
                  isComplete
                    ? "bg-green-100"
                    : progress > 50
                    ? "bg-yellow-100"
                    : "bg-orange-100"
                }`}
              >
                <Zap
                  className={`w-5 h-5 mx-auto mb-1 ${
                    isComplete
                      ? "text-green-600"
                      : progress > 50
                      ? "text-yellow-600"
                      : "text-orange-600"
                  }`}
                />
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div
                  className={`text-sm font-bold ${
                    isComplete
                      ? "text-green-600"
                      : progress > 50
                      ? "text-yellow-600"
                      : "text-orange-600"
                  }`}
                >
                  {isComplete ? "Done!" : progress > 50 ? "Great!" : "Going"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Milestones</h3>
              </div>
              <button
                onClick={() => setShowAddMilestone(true)}
                className={`flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r ${config.gradient} text-white rounded-full text-xs font-semibold hover:opacity-90 transition shadow-sm`}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-700">
                  {completedMilestones}/{milestones.length}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${config.gradient} h-2.5 rounded-full transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {milestones.map((milestone, index) => {
                const previousMilestones = milestones.slice(0, index);
                const allPreviousCompleted = previousMilestones.every(
                  (m) => m.completed
                );
                const canComplete =
                  milestone.completed || index === 0 || allPreviousCompleted;

                return (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      milestone.completed
                        ? "bg-green-50 border-green-200"
                        : canComplete
                        ? "bg-gray-50 border-gray-100 hover:border-gray-200"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <button
                      onClick={() => toggleMilestone(milestone.id)}
                      disabled={!canComplete && !milestone.completed}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        milestone.completed
                          ? "bg-green-500 text-white shadow-md shadow-green-200"
                          : canComplete
                          ? `border-2 border-gray-300 hover:border-current ${config.color} cursor-pointer`
                          : "border-2 border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {milestone.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          {index + 1}
                        </span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-sm ${
                          milestone.completed
                            ? "text-green-700 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {milestone.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            milestone.completed
                              ? "bg-green-100 text-green-600"
                              : `${config.lightBg} ${config.color}`
                          }`}
                        >
                          {milestone.targetValue}%
                        </span>
                        {milestone.completedDate && (
                          <span className="text-green-600">
                            ✓ {formatDate(milestone.completedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="p-2 hover:bg-red-100 rounded-xl transition text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {milestones.length === 0 && (
                <div className="text-center py-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center opacity-50`}
                  >
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    No milestones yet. Add some to track your progress!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Notes Section */}
        <div className="px-4 mt-6 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Progress Journal</h3>
            </div>

            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="How's your progress going? Add a note..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-300 focus:bg-white resize-none text-sm transition"
              />
              <button
                onClick={handleSaveNote}
                disabled={!progressNote.trim() || isSaving}
                className="mt-2 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <MealLoader size="small" />
                    Saving...
                  </>
                ) : (
                  "Save Note"
                )}
              </button>
            </div>

            {/* Notes History */}
            <div className="space-y-3">
              {progressHistory
                .slice()
                .reverse()
                .filter((entry: any) => entry.note)
                .slice(0, 5)
                .map((entry: any) => (
                  <div
                    key={entry.date}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">
                        {formatDate(entry.date)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          entry.value === 100
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {entry.value}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.note}</p>
                  </div>
                ))}

              {progressHistory.filter((e: any) => e.note).length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No notes yet. Start journaling your progress!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Milestone Modal */}
        {showAddMilestone && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add Milestone
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Complete first phase"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-300 focus:bg-white transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMilestone.title.trim()) {
                        handleAddMilestone();
                      }
                    }}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Milestones will be completed in order. This will be
                    milestone #{(goal?.milestones?.length || 0) + 1}.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-2xl text-gray-700 font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  className={`flex-1 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-2xl font-semibold hover:opacity-90 transition shadow-sm`}
                >
                  Add
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
