import { forwardRef } from "react";
import { Flame, Trophy } from "lucide-react";
import ShareableCard from "./ShareableCard";

interface StreakCardProps {
  streakDays: number;
  longestStreak?: number;
  userName?: string;
}

const StreakCard = forwardRef<HTMLDivElement, StreakCardProps>(
  ({ streakDays, longestStreak, userName }, ref) => {
    const getMilestoneEmoji = (days: number) => {
      if (days >= 365) return "";
      if (days >= 180) return "";
      if (days >= 90) return "";
      if (days >= 30) return "";
      if (days >= 14) return "";
      if (days >= 7) return "";
      return "";
    };

    const getGradient = (days: number) => {
      if (days >= 90) return "from-amber-500 via-orange-500 to-red-600";
      if (days >= 30) return "from-orange-500 to-red-500";
      if (days >= 7) return "from-yellow-500 to-orange-500";
      return "from-emerald-500 to-teal-600";
    };

    return (
      <ShareableCard ref={ref} gradient={getGradient(streakDays)}>
        {/* Header */}
        {userName && (
          <p className="mb-1 text-sm font-medium text-white/80">{userName}</p>
        )}

        {/* Main streak display */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute -inset-2 animate-pulse rounded-full bg-white/20" />
            <Flame className="relative h-16 w-16 text-white drop-shadow-lg" />
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-white drop-shadow-md">
              {streakDays}
            </div>
            <div className="text-lg font-medium text-white/90">Day Streak</div>
          </div>
        </div>

        {/* Milestone badge */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl">{getMilestoneEmoji(streakDays)}</span>
            <span className="font-semibold text-white">
              {streakDays >= 365
                ? "Year Champion!"
                : streakDays >= 180
                  ? "Half Year Hero!"
                  : streakDays >= 90
                    ? "Quarterly Master!"
                    : streakDays >= 30
                      ? "Monthly Champion!"
                      : streakDays >= 14
                        ? "Two Week Warrior!"
                        : streakDays >= 7
                          ? "Week Crusher!"
                          : "Building Momentum!"}
            </span>
          </div>
        </div>

        {/* Longest streak info */}
        {longestStreak && longestStreak > streakDays && (
          <div className="mt-3 flex items-center justify-center gap-2 text-white/70">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Personal best: {longestStreak} days</span>
          </div>
        )}
      </ShareableCard>
    );
  }
);

StreakCard.displayName = "StreakCard";

export default StreakCard;
