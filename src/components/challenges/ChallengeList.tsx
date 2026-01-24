import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Target, Trophy } from "lucide-react";
import { useChallengeStore } from "../../stores/challengeStore";
import { useEngagementStore } from "../../stores/engagementStore";
import { ChallengeCard } from "./ChallengeCard";
import { cn } from "../../lib/utils";
import { IChallenge } from "../../types/interfaces";

interface ChallengeListProps {
  className?: string;
  compact?: boolean;
  showTitle?: boolean;
  maxChallenges?: number;
  onViewAll?: () => void;
}

// Helper function to check if challenge is expired (by status or date)
const isChallengeExpired = (challenge: IChallenge): boolean => {
  if (challenge.status === "expired") return true;
  // Also check if endDate has passed (but don't mark completed/claimed as expired)
  if (challenge.status === "completed" || challenge.status === "claimed") return false;
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  return now > endDate;
};

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
  const fetchCompletedChallenges = useChallengeStore((state) => state.fetchCompletedChallenges);
  const claimReward = useChallengeStore((state) => state.claimReward);
  const refreshChallenges = useChallengeStore((state) => state.refreshChallenges);
  const archiveChallenge = useChallengeStore((state) => state.archiveChallenge);
  const deleteChallenge = useChallengeStore((state) => state.deleteChallenge);
  const loading = useChallengeStore((state) => state.loading);
  const challenges = useChallengeStore((state) => state.challenges);
  const claimableChallenges = useChallengeStore((state) => state.claimableChallenges);
  const completedChallenges = useChallengeStore((state) => state.completedChallenges);
  const fetchStats = useEngagementStore((state) => state.fetchStats);
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter out expired challenges - only show active, completed, and claimable
  // Exclude expired status and challenges past their endDate
  const relevantChallenges = useMemo(
    () => challenges.filter((c) => {
      // Don't show expired challenges
      if (isChallengeExpired(c)) return false;
      // Only show active or completed (not yet claimed)
      return c.status === "active" || c.status === "completed";
    }),
    [challenges]
  );

  useEffect(() => {
    fetchChallenges();
    fetchClaimableChallenges();
    fetchCompletedChallenges();
  }, [fetchChallenges, fetchClaimableChallenges, fetchCompletedChallenges]);

  const handleClaimReward = async (challengeId: string) => {
    const result = await claimReward(challengeId);
    if (result) {
      // Refresh engagement stats to show updated XP
      fetchStats();
      // Refresh completed challenges
      fetchCompletedChallenges();
    }
  };

  const handleArchive = async (challengeId: string) => {
    try {
      await archiveChallenge(challengeId);
      // Refresh all challenges to update the list
      await fetchChallenges();
      await fetchClaimableChallenges();
      fetchCompletedChallenges();
    } catch (error) {
      console.error("Failed to archive challenge:", error);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (window.confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
      try {
        await deleteChallenge(challengeId);
        // Refresh all challenges to update the list
        await fetchChallenges();
        await fetchClaimableChallenges();
        fetchCompletedChallenges();
      } catch (error) {
        console.error("Failed to delete challenge:", error);
      }
    }
  };

  // Combine active and claimable challenges, removing duplicates and expired - memoized
  const allChallenges = useMemo(() => {
    // Filter out expired from claimable
    const validClaimable = claimableChallenges.filter((c) => !isChallengeExpired(c));
    
    // Combine with relevant challenges, removing duplicates
    return [
      ...validClaimable,
      ...relevantChallenges.filter(
        (c) => !validClaimable.find((claimable) => claimable._id === c._id)
      ),
    ];
  }, [claimableChallenges, relevantChallenges]);

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
            onArchive={
              isChallengeExpired(challenge)
                ? handleArchive
                : undefined
            }
            onDelete={
              isChallengeExpired(challenge)
                ? handleDelete
                : undefined
            }
          />
        ))}
      </div>

      {/* Completed Challenges Section */}
      {completedChallenges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Completed Challenges ({completedChallenges.length})
            </h3>
            <span className="text-sm text-gray-500">
              {showCompleted ? "Hide" : "Show"}
            </span>
          </button>
          {showCompleted && (
            <div className={cn("space-y-2", compact ? "space-y-2" : "space-y-3")}>
              {completedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  compact={compact}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
