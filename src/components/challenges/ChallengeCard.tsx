import { Trophy, Clock, Star, Zap, Gift } from "lucide-react";
import { IChallenge } from "../../types/interfaces";
import { getChallengeProgress, getChallengeTimeRemaining, getDifficultyColor } from "../../stores/challengeStore";
import { cn } from "../../lib/utils";

// Icon mapping for challenge types
const CHALLENGE_ICONS: Record<string, React.ReactNode> = {
  utensils: <span className="text-lg">🍽️</span>,
  droplet: <span className="text-lg">💧</span>,
  droplets: <span className="text-lg">💧</span>,
  scale: <span className="text-lg">⚖️</span>,
  "clipboard-list": <span className="text-lg">📋</span>,
  beef: <span className="text-lg">🥩</span>,
  dumbbell: <span className="text-lg">🏋️</span>,
  flame: <span className="text-lg">🔥</span>,
  award: <span className="text-lg">🏆</span>,
  trophy: <span className="text-lg">🏆</span>,
  medal: <span className="text-lg">🏅</span>,
  star: <span className="text-lg">⭐</span>,
  zap: <span className="text-lg">⚡</span>,
};

interface ChallengeCardProps {
  challenge: IChallenge;
  onClaim?: () => void;
  compact?: boolean;
  className?: string;
}

export function ChallengeCard({ challenge, onClaim, compact = false, className }: ChallengeCardProps) {
  const progress = getChallengeProgress(challenge);
  const timeRemaining = getChallengeTimeRemaining(challenge);
  const isCompleted = challenge.status === "completed";
  const isClaimed = challenge.status === "claimed";
  const isExpired = challenge.status === "expired";

  const icon = CHALLENGE_ICONS[challenge.icon] || <Trophy className="w-5 h-5" />;

  // Difficulty badge colors
  const difficultyBgColors: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  if (compact) {
    return (
      <div
        className={cn(
          "p-3 bg-white rounded-lg shadow-sm border border-gray-100",
          isCompleted && "border-green-200 bg-green-50",
          isExpired && "opacity-60",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-800 truncate">{challenge.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isCompleted ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {challenge.progress}/{challenge.target}
              </span>
            </div>
          </div>
          {isCompleted && onClaim && (
            <button
              onClick={onClaim}
              className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <Gift className="w-3 h-3" />
              Claim
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 bg-white rounded-xl shadow-sm border border-gray-100",
        isCompleted && "border-green-200 bg-gradient-to-br from-green-50 to-white",
        isClaimed && "opacity-70",
        isExpired && "opacity-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
            <p className="text-xs text-gray-500">{challenge.description}</p>
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
            difficultyBgColors[challenge.difficulty] || "bg-gray-100"
          )}
        >
          {challenge.difficulty}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{challenge.progress}/{challenge.target}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCompleted ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-blue-400 to-blue-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          {/* Time Remaining */}
          {!isClaimed && !isExpired && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining}</span>
            </div>
          )}

          {/* XP Reward */}
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-medium">+{challenge.xpReward} XP</span>
          </div>
        </div>

        {/* Claim Button or Status */}
        {isCompleted && onClaim && (
          <button
            onClick={onClaim}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Gift className="w-4 h-4" />
            Claim Reward
          </button>
        )}
        {isClaimed && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Claimed
          </span>
        )}
        {isExpired && (
          <span className="text-xs text-red-400">Expired</span>
        )}
      </div>
    </div>
  );
}
