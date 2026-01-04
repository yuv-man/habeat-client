import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  Calendar,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Wand2,
  FileText,
} from "lucide-react";
import { useGoalsStore } from "@/stores/goalsStore";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import { GOAL_TYPES } from "@/lib/goalTypes";
import type { Milestone, Goal } from "@/components/goals/Goals";

interface MilestoneInput {
  id: string;
  title: string;
  completed: boolean;
}

type CreationMode = "select" | "manual" | "ai";

const CreateGoalPage = () => {
  const navigate = useNavigate();
  const { createGoal } = useGoalsStore();
  const { user } = useAuthStore();

  // Mode state
  const [mode, setMode] = useState<CreationMode>("select");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Form state for manual mode
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null
  );
  const [editingMilestoneTitle, setEditingMilestoneTitle] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // AI generation state
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiDuration, setAiDuration] = useState("");

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generated goal preview
  const [generatedGoal, setGeneratedGoal] = useState<{
    title: string;
    description: string;
    target: number;
    unit: string;
    milestones: MilestoneInput[];
  } | null>(null);

  // Get selected goal type details
  const selectedGoalType = GOAL_TYPES.find((t) => t.id === selectedType);

  // Handle goal type selection
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
  };

  // Handle mode selection after choosing type
  const handleModeSelect = (selectedMode: "manual" | "ai") => {
    setMode(selectedMode);
    if (selectedMode === "manual" && selectedGoalType) {
      // Pre-fill manual form with defaults
      setTitle("");
      setDescription("");
      setMilestones([]);
    }
  };

  // Calculate target date from duration
  const getTargetDate = (duration: string): string | undefined => {
    if (!duration) return undefined;
    const today = new Date();
    switch (duration) {
      case "1 week":
        today.setDate(today.getDate() + 7);
        break;
      case "2 weeks":
        today.setDate(today.getDate() + 14);
        break;
      case "1 month":
        today.setMonth(today.getMonth() + 1);
        break;
      case "2 months":
        today.setMonth(today.getMonth() + 2);
        break;
      case "3 months":
        today.setMonth(today.getMonth() + 3);
        break;
      case "6 months":
        today.setMonth(today.getMonth() + 6);
        break;
      default:
        return undefined;
    }
    return today.toISOString().split("T")[0];
  };

  // Generate goal with AI
  const handleGenerateWithAI = async () => {
    if (!selectedType || !user?._id) return;

    setIsGenerating(true);
    try {
      const response = await userAPI.generateGoal(user._id, {
        userId: user._id,
        title: aiTitle || `${selectedGoalType?.name} Goal`,
        description:
          aiDescription ||
          `Achieve my ${selectedGoalType?.name.toLowerCase()} target`,
        startDate: startDate,
        targetDate: getTargetDate(aiDuration),
        language: "en",
      });

      if (response.data) {
        const apiGoal = response.data;
        setGeneratedGoal({
          title: apiGoal.title || aiTitle || `${selectedGoalType?.name} Goal`,
          description:
            apiGoal.description ||
            aiDescription ||
            `Achieve your ${selectedGoalType?.name.toLowerCase()} target`,
          target: apiGoal.target || selectedGoalType?.defaultTarget || 100,
          unit: apiGoal.unit || selectedGoalType?.defaultUnit || "units",
          milestones: (apiGoal.milestones || []).map(
            (m: Milestone, i: number) => ({
              id: `milestone_${Date.now()}_${i}`,
              title: m.title,
              completed: false,
            })
          ),
        });
      }
    } catch (error) {
      console.error("Failed to generate goal:", error);
      // Generate fallback goal
      const fallbackMilestones = [
        "Start tracking progress",
        "Reach 25% of target",
        "Reach 50% of target",
        "Reach 75% of target",
        "Achieve goal",
      ];
      setGeneratedGoal({
        title: aiTitle || `${selectedGoalType?.name} Goal`,
        description:
          aiDescription ||
          `Work towards your ${selectedGoalType?.name.toLowerCase()} target`,
        target: selectedGoalType?.defaultTarget || 100,
        unit: selectedGoalType?.defaultUnit || "units",
        milestones: fallbackMilestones.map((title, i) => ({
          id: `milestone_${Date.now()}_${i}`,
          title,
          completed: false,
        })),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save AI generated goal
  const handleSaveGeneratedGoal = async () => {
    if (!generatedGoal || !selectedType) return;

    setIsSaving(true);
    try {
      const goalMilestones: Milestone[] = generatedGoal.milestones.map(
        (m, index) => ({
          id: m.id,
          title: m.title,
          targetValue: Math.round(
            ((index + 1) / generatedGoal.milestones.length) * 100
          ),
          completed: m.completed,
        })
      );

      await createGoal({
        title: generatedGoal.title,
        description: generatedGoal.description,
        current: 0, // Start at 0, will be calculated from milestones
        target: 100, // Always 100% for milestone-based goals
        unit: "", // No unit needed for milestone-based goals
        icon: selectedType as Goal["icon"],
        status: "in_progress",
        startDate: startDate,
        milestones: goalMilestones,
        progressHistory: [
          { date: new Date().toISOString().split("T")[0], value: 0 },
        ],
      });

      navigate("/goals");
    } catch (error) {
      console.error("Failed to save goal:", error);
      alert("Failed to save goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Manual mode milestone functions
  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `milestone_${Date.now()}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle("");
    setShowAddMilestone(false);
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    );
  };

  const handleStartEdit = (milestone: MilestoneInput) => {
    setEditingMilestoneId(milestone.id);
    setEditingMilestoneTitle(milestone.title);
  };

  const handleSaveEdit = () => {
    if (!editingMilestoneTitle.trim()) return;
    setMilestones(
      milestones.map((m) =>
        m.id === editingMilestoneId
          ? { ...m, title: editingMilestoneTitle.trim() }
          : m
      )
    );
    setEditingMilestoneId(null);
    setEditingMilestoneTitle("");
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  // Save manual goal
  const handleSaveManual = async () => {
    if (!title.trim() || !selectedType) {
      alert("Please enter a goal title");
      return;
    }

    if (milestones.length === 0) {
      alert("Please add at least one milestone");
      return;
    }

    setIsSaving(true);
    try {
      const goalMilestones: Milestone[] = milestones.map((m, index) => ({
        id: m.id,
        title: m.title,
        targetValue: Math.round(((index + 1) / milestones.length) * 100),
        completed: m.completed,
      }));

      await createGoal({
        title: title.trim(),
        description: description.trim(),
        current: 0, // Start at 0, will be calculated from milestones
        target: 100, // Always 100% for milestone-based goals
        unit: "", // No unit needed for milestone-based goals
        icon: selectedType as Goal["icon"],
        status: "in_progress",
        startDate: startDate,
        milestones: goalMilestones,
        progressHistory: [
          { date: new Date().toISOString().split("T")[0], value: 0 },
        ],
      });

      navigate("/goals");
    } catch (error) {
      console.error("Failed to create goal:", error);
      alert("Failed to create goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to type selection
  const handleBack = () => {
    if (mode === "select") {
      navigate("/goals");
    } else if (generatedGoal) {
      setGeneratedGoal(null);
    } else {
      setMode("select");
      setSelectedType(null);
    }
  };

  return (
    <DashboardLayout bgColor="bg-white" showNavBar={true}>
      <div className="min-h-screen bg-white pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={handleBack}
              className="p-1 text-gray-600 hover:text-gray-900 transition"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "select"
                ? "Create Goal"
                : mode === "ai"
                ? "AI Goal Generator"
                : "Manual Goal"}
            </h1>
            <div className="w-6 h-6" />
          </div>
        </div>

        {/* Step 1: Select Goal Type */}
        {mode === "select" && (
          <div className="px-4 py-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                What would you like to achieve?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Select a goal category to get started
              </p>
              <div className="grid grid-cols-4 gap-2">
                {GOAL_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span
                        className={`text-[10px] font-medium text-center leading-tight ${
                          isSelected ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {type.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selection */}
            {selectedType && (
              <div className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  How do you want to create it?
                </h2>

                <button
                  onClick={() => handleModeSelect("ai")}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Generate with AI</div>
                    <div className="text-sm text-green-100">
                      AI creates goal, targets & milestones for you
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 ml-auto" />
                </button>

                <button
                  onClick={() => handleModeSelect("manual")}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      Create Manually
                    </div>
                    <div className="text-sm text-gray-500">
                      Set your own targets and milestones
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Mode */}
        {mode === "ai" && !generatedGoal && (
          <div className="px-4 py-6 space-y-6">
            {/* Selected Type Display */}
            {selectedGoalType && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-10 h-10 ${selectedGoalType.color} rounded-lg flex items-center justify-center`}
                >
                  <selectedGoalType.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedGoalType.name} Goal
                  </div>
                  <div className="text-xs text-gray-500">
                    AI will generate personalized targets
                  </div>
                </div>
              </div>
            )}

            {/* Optional inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                placeholder="e.g., Lose 10kg by summer"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Tell AI more about your goal..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Duration{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={aiDuration}
                onChange={(e) => setAiDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="">Let AI decide</option>
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <MealLoader size="small" />
                  Generating your goal...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Goal with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Generated Goal Preview */}
        {mode === "ai" && generatedGoal && (
          <div className="px-4 py-6 space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI Generated
              </div>
            </div>

            {/* Goal Preview Card */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                {selectedGoalType && (
                  <div
                    className={`w-12 h-12 ${selectedGoalType.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <selectedGoalType.icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {generatedGoal.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {generatedGoal.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Milestones ({generatedGoal.milestones.length})
              </h3>
              <div className="space-y-2">
                {generatedGoal.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-900">
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveGeneratedGoal}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <MealLoader size="small" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Goal
                </>
              )}
            </button>

            <button
              onClick={() => setGeneratedGoal(null)}
              className="w-full py-3 text-gray-600 font-medium hover:text-gray-900 transition"
            >
              Regenerate
            </button>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="px-4 py-6 space-y-5">
            {/* Selected Type Display */}
            {selectedGoalType && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-10 h-10 ${selectedGoalType.color} rounded-lg flex items-center justify-center`}
                >
                  <selectedGoalType.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-gray-900">
                  {selectedGoalType.name} Goal
                </div>
              </div>
            )}

            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lose 5kg this month"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this goal important to you?"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative min-w-0">
                  <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-3 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="relative min-w-0">
                  <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-3 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Milestones Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Milestones
                </label>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {showAddMilestone && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Milestone title..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddMilestone();
                      if (e.key === "Escape") {
                        setShowAddMilestone(false);
                        setNewMilestoneTitle("");
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleAddMilestone}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {milestones.length === 0 ? (
                  <p className="text-center text-gray-400 py-4 text-sm">
                    No milestones yet
                  </p>
                ) : (
                  milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => handleToggleMilestone(milestone.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${
                          milestone.completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {milestone.completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                      {editingMilestoneId === milestone.id ? (
                        <input
                          type="text"
                          value={editingMilestoneTitle}
                          onChange={(e) =>
                            setEditingMilestoneTitle(e.target.value)
                          }
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") {
                              setEditingMilestoneId(null);
                              setEditingMilestoneTitle("");
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-green-500 rounded text-sm"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`flex-1 text-sm ${
                            milestone.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {milestone.title}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(milestone)}
                        className="p-1 text-gray-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="p-1 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveManual}
              disabled={isSaving || !title.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition disabled:opacity-50 mt-4"
            >
              {isSaving ? (
                <>
                  <MealLoader size="small" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Goal
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateGoalPage;
