import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { IMoodEntry, MoodCategory } from "@/types/interfaces";
import { cn } from "@/lib/utils";

interface MoodHistoryChartProps {
  moodEntries: IMoodEntry[];
  className?: string;
  variant?: "line" | "area";
  showTrend?: boolean;
  days?: number;
}

const MOOD_COLORS: Record<MoodCategory, string> = {
  happy: "#facc15",
  calm: "#3b82f6",
  energetic: "#f97316",
  neutral: "#9ca3af",
  tired: "#6366f1",
  stressed: "#ef4444",
  anxious: "#a855f7",
  sad: "#06b6d4",
  angry: "#f43f5e",
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export function MoodHistoryChart({
  moodEntries,
  className,
  variant = "area",
  showTrend = true,
  days = 7,
}: MoodHistoryChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    const grouped: Record<string, { moods: IMoodEntry[]; avgLevel: number; dominantMood: MoodCategory }> = {};

    // Get last N days
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      grouped[dateKey] = { moods: [], avgLevel: 0, dominantMood: "neutral" };
    }

    // Group entries by date
    moodEntries.forEach((entry) => {
      const dateKey = entry.date.split("T")[0];
      if (grouped[dateKey]) {
        grouped[dateKey].moods.push(entry);
      }
    });

    // Calculate averages and dominant mood
    return Object.entries(grouped).map(([date, data]) => {
      if (data.moods.length === 0) {
        return {
          date,
          shortDate: formatShortDate(date),
          avgLevel: null,
          dominantMood: null,
          count: 0,
        };
      }

      const avgLevel = data.moods.reduce((sum, m) => sum + m.moodLevel, 0) / data.moods.length;

      // Find dominant mood
      const moodCounts: Record<string, number> = {};
      data.moods.forEach((m) => {
        moodCounts[m.moodCategory] = (moodCounts[m.moodCategory] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodCategory || "neutral";

      return {
        date,
        shortDate: formatShortDate(date),
        avgLevel: Math.round(avgLevel * 10) / 10,
        dominantMood,
        count: data.moods.length,
      };
    });
  }, [moodEntries, days]);

  // Calculate trend
  const trend = useMemo(() => {
    const validData = chartData.filter((d) => d.avgLevel !== null);
    if (validData.length < 2) return { direction: "neutral", value: 0 };

    const firstHalf = validData.slice(0, Math.floor(validData.length / 2));
    const secondHalf = validData.slice(Math.floor(validData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + (d.avgLevel || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + (d.avgLevel || 0), 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.3) return { direction: "up", value: Math.round(diff * 10) / 10 };
    if (diff < -0.3) return { direction: "down", value: Math.abs(Math.round(diff * 10) / 10) };
    return { direction: "neutral", value: 0 };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    if (data.avgLevel === null) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <p className="text-sm font-medium text-gray-800">{formatDate(data.date)}</p>
        <p className="text-sm text-gray-600">
          Avg Mood: <span className="font-semibold">{data.avgLevel}/5</span>
        </p>
        <p className="text-sm text-gray-600">
          Dominant: <span className="font-semibold capitalize">{data.dominantMood}</span>
        </p>
        <p className="text-xs text-gray-400">{data.count} entries</p>
      </div>
    );
  };

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Mood Trends</h3>
        {showTrend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.direction === "up" && "bg-green-100 text-green-600",
              trend.direction === "down" && "bg-red-100 text-red-600",
              trend.direction === "neutral" && "bg-gray-100 text-gray-600"
            )}
          >
            {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
            {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
            {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
            {trend.direction === "up" && `+${trend.value}`}
            {trend.direction === "down" && `-${trend.value}`}
            {trend.direction === "neutral" && "Stable"}
          </div>
        )}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "area" ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgLevel"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#moodGradient)"
                connectNulls
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avgLevel"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                connectNulls
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Mood dots legend */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        {chartData.filter((d) => d.dominantMood).map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-xs text-gray-500"
            title={`${formatDate(d.date)}: ${d.dominantMood}`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: MOOD_COLORS[d.dominantMood as MoodCategory] || "#9ca3af" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
