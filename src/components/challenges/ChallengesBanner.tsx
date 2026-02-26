import { useState, useEffect, useMemo } from "react";
import { Target, ChevronDown, ChevronUp, Gift } from "lucide-react";
import {
  useChallengeStore,
  getChallengeProgress,
} from "../../stores/challengeStore";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

// Icon mapping for challenge types
const CHALLENGE_ICONS: Record<string, string> = {
  utensils: "🍽️",
  droplet: "💧",
  droplets: "💧",
  scale: "⚖️",
  "clipboard-list": "📋",
  beef: "🥩",
  dumbbell: "🏋️",
  flame: "🔥",
  award: "🏆",
  trophy: "🏆",
  medal: "🏅",
  star: "⭐",
  zap: "⚡",
};

interface ChallengesBannerProps {
  className?: string;
}

export function ChallengesBanner({ className }: ChallengesBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use individual selectors to avoid object creation on every render
  const fetchChallenges = useChallengeStore((state) => state.fetchChallenges);
  const fetchClaimableChallenges = useChallengeStore(
    (state) => state.fetchClaimableChallenges
  );
  const claimReward = useChallengeStore((state) => state.claimReward);
  const loading = useChallengeStore((state) => state.loading);
  const challenges = useChallengeStore((state) => state.challenges);
  const claimableChallenges = useChallengeStore(
    (state) => state.claimableChallenges
  );
  const fetchStats = useEngagementStore((state) => state.fetchStats);

  // Filter daily challenges - challenges that are active today
  const dailyChallenges = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    return challenges.filter((c) => {
      // Must be active status
      if (c.status !== "active") return false;

      // Check if challenge is active today (startDate <= today <= endDate)
      const startDate = new Date(c.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(c.endDate);
      endDate.setHours(23, 59, 59, 999);

      return today >= startDate && today <= endDate;
    });
  }, [challenges]);

  // Filter claimable challenges that are daily (completed today)
  const dailyClaimableChallenges = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return claimableChallenges.filter((c) => {
      const endDate = new Date(c.endDate);
      endDate.setHours(23, 59, 59, 999);
      return today <= endDate;
    });
  }, [claimableChallenges]);

  useEffect(() => {
    useChallengeStore.getState().fetchChallenges();
    useChallengeStore.getState().fetchClaimableChallenges();
  }, []);

  const handleClaimReward = async (challengeId: string) => {
    const result = await claimReward(challengeId);
    if (result) {
      // Refresh engagement stats to show updated XP
      fetchStats();
    }
  };

  // Combine daily active and claimable challenges, removing duplicates - memoized
  const allDailyChallenges = useMemo(
    () => [
      ...dailyClaimableChallenges,
      ...dailyChallenges.filter(
        (c) =>
          !dailyClaimableChallenges.find((claimable) => claimable._id === c._id)
      ),
    ],
    [dailyClaimableChallenges, dailyChallenges]
  );

  // Show max 3 challenges in collapsed view
  const visibleChallenges = useMemo(
    () => allDailyChallenges.slice(0, 3),
    [allDailyChallenges]
  );

  if (loading && allDailyChallenges.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 py-2 px-4 bg-white rounded-lg shadow-sm animate-pulse",
          className
        )}
      >
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-5 bg-gray-200 rounded w-28" />
      </div>
    );
  }

  if (allDailyChallenges.length === 0) {
    return null; // Don't show banner if no daily challenges
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm", className)}>
      {/* Challenges Display */}
      <div className="py-2 px-4">
        {/* Visible Challenges */}
        <div className="space-y-2">
          {visibleChallenges.map((challenge) => {
            const isCompleted = challenge.status === "completed";
            const icon = CHALLENGE_ICONS[challenge.icon] || "🎯";

            return (
              <div
                key={challenge._id}
                className={cn(
                  "p-2 rounded-lg bg-gray-100",
                  isCompleted && "bg-green-50 border border-green-200"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <div className="flex min-w-0 justify-between w-full">
                    <p className="text-sm text-gray-600 mt-0.5">
                      {challenge.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {challenge.progress}/{challenge.target}
                    </p>
                  </div>
                  {isCompleted && (
                    <button
                      onClick={() => handleClaimReward(challenge._id)}
                      className="px-2 py-1 bg-green-500 text-white text-[10px] font-medium rounded-full hover:bg-green-600 transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Gift className="w-3 h-3" />
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {allDailyChallenges.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 py-1.5 text-xs text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show {allDailyChallenges.length - 3} More
              </>
            )}
          </button>
        )}
      </div>

      {/* Expanded Challenges */}
      {isExpanded && allDailyChallenges.length > 3 && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="space-y-2">
            {allDailyChallenges.slice(3).map((challenge) => {
              const isCompleted = challenge.status === "completed";
              const icon = CHALLENGE_ICONS[challenge.icon] || "🎯";

              return (
                <div
                  key={challenge._id}
                  className={cn(
                    "p-2 rounded-lg",
                    isCompleted && "bg-green-50 border border-green-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">
                        {challenge.title}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {challenge.description}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {challenge.progress}/{challenge.target}
                      </p>
                    </div>
                    {isCompleted && (
                      <button
                        onClick={() => handleClaimReward(challenge._id)}
                        className="px-2 py-1 bg-green-500 text-white text-[10px] font-medium rounded-full hover:bg-green-600 transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <Gift className="w-3 h-3" />
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
