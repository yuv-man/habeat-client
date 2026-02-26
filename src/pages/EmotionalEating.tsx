import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Utensils, Brain, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmotionalEatingInsights } from "@/components/cbt/EmotionalEatingInsights";
import { CBTExercises } from "@/components/cbt/CBTExercises";
import DashboardLayout from "@/components/layout/DashboardLayout";

const EmotionalEating = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [activeTab, setActiveTab] = useState<"insights" | "exercises">("insights");

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-gray-50">
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/mindfulness")}
            className="p-2 -ml-2 hover:bg-white/20 rounded-lg transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Utensils className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Emotional Eating</h1>
          </div>
          <p className="text-white/80">
            Understand the connection between your emotions and eating habits
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab("insights")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === "insights"
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Brain className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab("exercises")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === "exercises"
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              Exercises
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {activeTab === "insights" && (
          <div className="space-y-4">
            {/* Period selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("week")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  period === "week"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                This Week
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  period === "month"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                This Month
              </button>
            </div>

            <EmotionalEatingInsights period={period} />

            {/* Tips card */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Tips for Mindful Eating
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Pause before eating and ask: "Am I actually hungry?"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Rate your hunger on a scale of 1-10
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Notice any emotions you're feeling
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  If eating emotionally, try a 10-minute delay
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Consider alternative ways to address the emotion
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "exercises" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              These exercises are specifically designed to help with emotional eating patterns.
            </p>
            <CBTExercises category="eating" showRecommended={false} />
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default EmotionalEating;
