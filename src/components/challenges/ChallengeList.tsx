import { useEffect, useMemo } from "react";
import { RefreshCw, Target } from "lucide-react";
import { useChallengeStore } from "../../stores/challengeStore";
import { useEngagementStore } from "../../stores/engagementStore";
import { ChallengeCard } from "./ChallengeCard";
import { cn } from "../../lib/utils";

interface ChallengeListProps {
  className?: string;
  compact?: boolean;
  showTitle?: boolean;
  maxChallenges?: number;
  onViewAll?: () => void;
}

export function ChallengeList({
  className,
  compact = false,
  showTitle = true,
  maxChallenges,
  onViewAll,
}: ChallengeListProps) {
  // Use individual selectors to avoid object creation on every render
  const fetchChallenges = useChallengeStore((state) => state.fetchChallenges);
  const fetchClaimableChallenges = useChallengeStore((state) => state.fetchClaimableChallenges);
  const claimReward = useChallengeStore((state) => state.claimReward);
  const refreshChallenges = useChallengeStore((state) => state.refreshChallenges);
  const loading = useChallengeStore((state) => state.loading);
  const challenges = useChallengeStore((state) => state.challenges);
  const claimableChallenges = useChallengeStore((state) => state.claimableChallenges);
  const fetchStats = useEngagementStore((state) => state.fetchStats);

  // Use useMemo to filter active challenges to avoid infinite loop
  const activeChallenges = useMemo(
    () => challenges.filter((c) => c.status === "active"),
    [challenges]
  );

  useEffect(() => {
    fetchChallenges();
    fetchClaimableChallenges();
  }, [fetchChallenges, fetchClaimableChallenges]);

  const handleClaimReward = async (challengeId: string) => {
    const result = await claimReward(challengeId);
    if (result) {
      // Refresh engagement stats to show updated XP
      fetchStats();
    }
  };

  // Combine active and claimable challenges, removing duplicates - memoized
  const allChallenges = useMemo(() => [
    ...claimableChallenges,
    ...activeChallenges.filter(
      (c) => !claimableChallenges.find((claimable) => claimable._id === c._id)
    ),
  ], [claimableChallenges, activeChallenges]);

  const displayChallenges = useMemo(
    () => maxChallenges ? allChallenges.slice(0, maxChallenges) : allChallenges,
    [allChallenges, maxChallenges]
  );

  if (loading && allChallenges.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        {showTitle && (
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        )}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allChallenges.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        {showTitle && (
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Daily Challenges
            </h3>
          </div>
        )}
        <div className="p-6 bg-white rounded-xl shadow-sm text-center">
          <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No active challenges</p>
          <button
            onClick={refreshChallenges}
            disabled={loading}
            className="mt-3 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Get New Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Daily Challenges
            {claimableChallenges.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {claimableChallenges.length} ready!
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {onViewAll && displayChallenges.length < allChallenges.length && (
              <button
                onClick={onViewAll}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View All
              </button>
            )}
            <button
              onClick={refreshChallenges}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh challenges"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      )}

      <div className={cn("space-y-2", compact ? "space-y-2" : "space-y-3")}>
        {displayChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge._id}
            challenge={challenge}
            compact={compact}
            onClaim={
              challenge.status === "completed"
                ? () => handleClaimReward(challenge._id)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
