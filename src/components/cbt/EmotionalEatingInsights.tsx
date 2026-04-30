import { useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line,
} from "recharts";
import {
  TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Utensils, Brain,
  Heart, Sparkles, MapPin,
} from "lucide-react";
import { useCBTStore, useEmotionalEatingInsight } from "@/stores/cbtStore";
import { cn } from "@/lib/utils";

interface EmotionalEatingInsightsProps {
  className?: string;
  period?: "week" | "month";
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export function EmotionalEatingInsights({
  className,
  period = "week",
}: EmotionalEatingInsightsProps) {
  const { fetchEmotionalEatingInsight, loading } = useCBTStore();
  const insight = useEmotionalEatingInsight();

  useEffect(() => {
    fetchEmotionalEatingInsight(period);
  }, [fetchEmotionalEatingInsight, period]);

  const triggerChartData = useMemo(() => {
    if (!insight?.commonTriggers) return [];
    return insight.commonTriggers.slice(0, 5).map((t, i) => ({
      name: t.trigger,
      value: t.count,
      fill: COLORS[i % COLORS.length],
    }));
  }, [insight]);

  const emotionChartData = useMemo(() => {
    if (!insight?.commonEmotions) return [];
    return insight.commonEmotions.slice(0, 5).map((e, i) => ({
      name: e.emotion,
      value: e.count,
      fill: COLORS[i % COLORS.length],
    }));
  }, [insight]);

  const mealTypeData = useMemo(() => {
    if (!insight?.mealTypeBreakdown) return [];
    const b = insight.mealTypeBreakdown;
    return [
      { name: "Breakfast", value: b.breakfast, fill: "#f97316" },
      { name: "Lunch", value: b.lunch, fill: "#eab308" },
      { name: "Dinner", value: b.dinner, fill: "#3b82f6" },
      { name: "Snacks", value: b.snacks, fill: "#8b5cf6" },
    ].filter((d) => d.value > 0);
  }, [insight]);

  const trendData = useMemo(() => {
    if (!insight?.weeklyTrend) return [];
    return insight.weeklyTrend.map((w, i) => ({
      label: `W${i + 1}`,
      score: w.score,
    }));
  }, [insight]);

  if (loading && !insight) {
    return (
      <div className={cn("p-6 text-center text-gray-500", className)}>
        Loading insights...
      </div>
    );
  }

  if (!insight || insight.totalMeals === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-gray-50 text-center", className)}>
        <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-1">No data yet</p>
        <p className="text-sm text-gray-400">
          Start linking your moods to meals to get insights
        </p>
      </div>
    );
  }

  const mindfulScore = insight.mindfulEatingScore ?? (100 - Math.round(insight.emotionalEatingPercentage ?? 0));
  const isHigh = mindfulScore >= 75;
  const isMedium = mindfulScore >= 50;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main stat card — Mindful Eating Score */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mindful Eating Score</h3>
          <span className="text-sm opacity-80">
            {period === "week" ? "This Week" : "This Month"}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: mindfulScore },
                    { value: 100 - mindfulScore },
                  ]}
                  innerRadius={30}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill={isHigh ? "#22c55e" : isMedium ? "#f97316" : "#ef4444"} />
                  <Cell fill="rgba(255,255,255,0.2)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{mindfulScore}</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm opacity-80 mb-1">
              {insight.emotionalEatingInstances} of {insight.totalMeals} meals showed emotional eating patterns
            </p>
            <div className="flex items-center gap-2">
              {isHigh ? (
                <>
                  <Sparkles className="w-4 h-4 text-green-300" />
                  <span className="text-sm">Great mindful eating habits!</span>
                </>
              ) : isMedium ? (
                <>
                  <TrendingUp className="w-4 h-4 text-yellow-200" />
                  <span className="text-sm">You're building awareness</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-300" />
                  <span className="text-sm">Some patterns to work on</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern spotlight */}
      {insight.patternSpotlight && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800 mb-0.5">Pattern noticed</p>
            <p className="text-sm text-indigo-700">{insight.patternSpotlight}</p>
          </div>
        </div>
      )}

      {/* Strongest meal type */}
      {insight.strongestMealType && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">
            You make your most mindful choices at{" "}
            <span className="font-semibold capitalize">{insight.strongestMealType}</span>
          </p>
        </div>
      )}

      {/* Weekly trend sparkline */}
      {trendData.length > 1 && (
        <div className="p-4 rounded-xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-500" />
            <h4 className="font-semibold text-gray-800 text-sm">4-Week Trend</h4>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  formatter={(v) => [`${v}`, "Mindful Score"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Triggers and emotions */}
      <div className="grid grid-cols-2 gap-4">
        {triggerChartData.length > 0 && (
          <div className="p-4 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-gray-800 text-sm">Top Triggers</h4>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triggerChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={60} />
                  <Tooltip formatter={(value) => [`${value} times`, "Count"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {emotionChartData.length > 0 && (
          <div className="p-4 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold text-gray-800 text-sm">Common Emotions</h4>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={60} />
                  <Tooltip formatter={(value) => [`${value} times`, "Count"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Meal type breakdown */}
      {mealTypeData.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-blue-500" />
            <h4 className="font-semibold text-gray-800 text-sm">
              Eating Patterns by Meal
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mealTypeData} innerRadius={25} outerRadius={40} dataKey="value" label={false}>
                    {mealTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} times`, "Count"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {mealTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                  <span className="text-xs font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-amber-800 text-sm">Things that might help</h4>
          </div>
          <ul className="space-y-2">
            {insight.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="text-amber-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
