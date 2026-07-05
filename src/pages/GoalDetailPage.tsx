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
  Lock,
  Share2,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGoalsStore } from "@/stores/goalsStore";
import { useAuthStore } from "@/stores/authStore";
import MealLoader from "@/components/helper/MealLoader";
import { getGoalConfig } from "@/lib/goalTypes";
import type { Goal, Milestone } from "@/components/goals/Goals";
import { cn } from "@/lib/utils";

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
  const [newMilestone, setNewMilestone] = useState({ title: "" });
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
        startDate: storeGoal.startDate || new Date().toISOString().split("T")[0],
        milestones: storeGoal.milestones || [],
        progressHistory: storeGoal.progressHistory || [],
      } as Goal);
    }
  }, [goals, goalId]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const calculateProgress = (milestones: Milestone[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.completed);
    if (completed.length === 0) return 0;
    return Math.max(...completed.map((m) => m.targetValue));
  };

  const handleAddMilestone = () => {
    if (!goal || !newMilestone.title.trim()) return;
    const milestone: Milestone = {
      id: `m${Date.now()}`,
      title: newMilestone.title.trim(),
      targetValue: 100,
      completed: false,
    };
    const updatedMilestones = [...(goal.milestones || []), milestone];
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
    if (newCompleted && milestoneIndex > 0) {
      const allPreviousCompleted = milestones.slice(0, milestoneIndex).every((m) => m.completed);
      if (!allPreviousCompleted) {
        alert("Please complete previous milestones first");
        return;
      }
    }
    const updatedMilestones = milestones.map((m, index) => {
      if (m.id === milestoneId)
        return { ...m, completed: newCompleted, completedDate: newCompleted ? new Date().toISOString().split("T")[0] : undefined };
      if (!newCompleted && index > milestoneIndex && m.completed)
        return { ...m, completed: false, completedDate: undefined };
      return m;
    });
    setGoal({ ...goal, milestones: updatedMilestones, current: calculateProgress(updatedMilestones) });
    try {
      for (let i = milestoneIndex; i < updatedMilestones.length; i++) {
        const m = updatedMilestones[i];
        if (m.completed !== milestones[i].completed) {
          await storeMilestoneUpdate(goal.id, m.id, m.completed);
        }
      }
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  const deleteMilestone = (milestoneId: string) => {
    if (!goal) return;
    const updatedMilestones = (goal.milestones || []).filter((m) => m.id !== milestoneId);
    setGoal({ ...goal, milestones: updatedMilestones, current: calculateProgress(updatedMilestones) });
    updateGoal(goal.id, { milestones: updatedMilestones } as any);
  };

  const handleSaveNote = async () => {
    if (!goal || !progressNote.trim()) return;
    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const progress = calculateProgress(goal.milestones || []);
    const newEntry = { date: today, value: progress, note: progressNote.trim() };
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
      <DashboardLayout bgColor="bg-[#faf9f6]" showNavBar={false}>
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Goal not found
        </div>
      </DashboardLayout>
    );
  }

  const config = getGoalConfig(goal.icon);
  const milestones = goal.milestones || [];
  const progressHistory = goal.progressHistory || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progress = calculateProgress(milestones);
  const isComplete = progress === 100;
  const progressPct = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0;

  // SVG ring math
  const R = 80;
  const circ = 2 * Math.PI * R; // ≈ 502.65
  const offset = circ * (1 - progressPct / 100);

  const statusLabel = isComplete ? "Done!" : progress > 50 ? "Great!" : "Going";
  const statusColor = isComplete ? "text-green-600" : "text-[#5f5a80]";
  const statusBg = isComplete ? "bg-green-50" : "bg-violet-50";

  return (
    <DashboardLayout bgColor="bg-[#faf9f6]" showNavBar={false}>
      <div className="min-h-screen bg-[#faf9f6] pb-32">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/goals")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">My Goals</h2>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-700" />
              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Achieved!</span>
            </div>
          )}
          {!isComplete && (
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="px-5 space-y-5 pt-2">

          {/* Hero Card */}
          <section className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(39,78,59,0.1)] border border-gray-100 border-b-4 border-b-green-800/20 p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-800/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col items-center text-center gap-5 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{goal.description}</p>
                )}
              </div>

              {/* Circular progress ring */}
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48">
                  <circle
                    cx="96" cy="96" r={R}
                    fill="transparent"
                    stroke="#efeeeb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="96" cy="96" r={R}
                    fill="transparent"
                    stroke={isComplete ? "#16a34a" : "#274e3b"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-gray-900 leading-none">{progressPct}%</span>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Complete</span>
                </div>
              </div>

              {/* Stats bento */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-1">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Started</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatDate(goal.startDate || new Date().toISOString())}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-1">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Milestones</span>
                  <span className="text-sm font-bold text-gray-900">
                    {completedMilestones}/{milestones.length}
                  </span>
                </div>
                <div className={cn("p-4 rounded-xl flex flex-col items-center gap-1", statusBg)}>
                  <Zap className={cn("w-5 h-5", statusColor)} />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                  <span className={cn("text-sm font-bold", statusColor)}>{statusLabel}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Milestones Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Milestones</h3>
              </div>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="flex items-center gap-1 px-4 py-1.5 bg-gray-800 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>Progress</span>
                <span>{completedMilestones}/{milestones.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-800 rounded-full transition-all duration-700"
                  style={{ width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Milestone cards */}
            <div className="space-y-3">
              {milestones.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Target className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">No milestones yet. Add one to get started.</p>
                </div>
              )}

              {milestones.map((milestone, index) => {
                const previousCompleted = milestones.slice(0, index).every((m) => m.completed);
                const canAct = milestone.completed || index === 0 || previousCompleted;
                const isLocked = !canAct && !milestone.completed;
                const isInProgress = !milestone.completed && canAct;

                if (milestone.completed) {
                  // Completed state
                  return (
                    <div
                      key={milestone.id}
                      className="bg-green-50 border border-green-200 p-5 rounded-2xl flex gap-4 shadow-[0_4px_20px_-4px_rgba(39,78,59,0.08)] relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 h-full w-1.5 bg-green-700 rounded-r-2xl" />
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2 pr-4">
                        <p className="text-sm font-semibold text-green-800 leading-snug">{milestone.title}</p>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-green-200/60 text-green-800 rounded-full text-xs font-semibold">
                            {milestone.targetValue}%
                          </span>
                          {milestone.completedDate && (
                            <span className="flex items-center gap-1 text-green-700/70 text-xs font-medium">
                              <Check className="w-3 h-3" />
                              {formatDate(milestone.completedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors self-center flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }

                if (isLocked) {
                  // Locked state
                  return (
                    <div
                      key={milestone.id}
                      className="bg-white border border-gray-100 p-5 rounded-2xl flex gap-4 opacity-60"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-400">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-400 leading-snug">{milestone.title}</p>
                      </div>
                      <div className="self-center flex-shrink-0 text-gray-300">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  );
                }

                // In-progress / next up state
                return (
                  <div
                    key={milestone.id}
                    className="bg-white border border-gray-100 border-b-2 border-b-violet-200/60 p-5 rounded-2xl flex gap-4 shadow-[0_4px_20px_-4px_rgba(39,78,59,0.06)]"
                  >
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleMilestone(milestone.id)}
                        className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-green-600 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-400">{index + 1}</span>
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{milestone.title}</p>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                          {milestone.targetValue}%
                        </span>
                        <span className="flex items-center gap-1 text-violet-600 text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          In progress
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors self-center flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Progress Journal */}
          <section className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(39,78,59,0.06)] border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900">Progress Journal</h3>
            </div>
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="How's your progress going? Add a note..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-300 focus:bg-white resize-none text-sm transition"
            />
            <button
              onClick={handleSaveNote}
              disabled={!progressNote.trim() || isSaving}
              className="mt-2 w-full py-3 bg-gray-800 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold text-sm transition hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              {isSaving ? <><MealLoader size="small" />Saving...</> : "Save Note"}
            </button>
            <div className="space-y-3 mt-4">
              {progressHistory
                .slice()
                .reverse()
                .filter((e: any) => e.note)
                .slice(0, 5)
                .map((entry: any) => (
                  <div key={entry.date} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-400">{formatDate(entry.date)}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", entry.value === 100 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                        {entry.value}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.note}</p>
                  </div>
                ))}
              {progressHistory.filter((e: any) => e.note).length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">No notes yet. Start journaling your progress!</p>
              )}
            </div>
          </section>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowAddMilestone(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 hover:scale-105 active:scale-90 transition-all z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add Milestone</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Milestone Title</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ title: e.target.value })}
                  placeholder="e.g., Complete first phase"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-green-300 focus:bg-white transition text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && newMilestone.title.trim()) handleAddMilestone(); }}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-400">
                  Milestones are completed in order. This will be #{(goal?.milestones?.length || 0) + 1}.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMilestone(false)}
                className="flex-1 py-3 bg-gray-100 rounded-2xl text-gray-700 font-semibold hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestone.title.trim()}
                className="flex-1 py-3 bg-green-800 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold hover:bg-green-700 transition text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GoalDetailPage;
