import { forwardRef } from "react";
import { Award, Star } from "lucide-react";
import ShareableCard from "./ShareableCard";

interface BadgeCardProps {
  badgeName: string;
  badgeDescription?: string;
  badgeIcon?: string;
  badgeCategory?: string;
  userName?: string;
  earnedAt?: Date;
}

const categoryGradients: Record<string, string> = {
  streak: "from-amber-500 to-orange-600",
  meals: "from-emerald-500 to-green-600",
  nutrition: "from-blue-500 to-indigo-600",
  milestone: "from-purple-500 to-pink-600",
  special: "from-rose-500 to-red-600",
  consistency: "from-teal-500 to-cyan-600",
  hydration: "from-sky-500 to-blue-600",
  default: "from-violet-500 to-purple-600",
};

const BadgeCard = forwardRef<HTMLDivElement, BadgeCardProps>(
  ({ badgeName, badgeDescription, badgeIcon, badgeCategory, userName, earnedAt }, ref) => {
    const gradient = categoryGradients[badgeCategory || "default"] || categoryGradients.default;

    return (
      <ShareableCard ref={ref} gradient={gradient}>
        {/* Header */}
        {userName && (
          <p className="mb-2 text-sm font-medium text-white/80">{userName} earned</p>
        )}

        {/* Badge display */}
        <div className="flex flex-col items-center">
          {/* Badge icon container */}
          <div className="relative mb-4">
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl" />

            {/* Star decorations */}
            <Star className="absolute -left-6 -top-2 h-4 w-4 text-yellow-300 opacity-80" />
            <Star className="absolute -right-4 top-0 h-3 w-3 text-yellow-300 opacity-60" />
            <Star className="absolute -bottom-1 -right-6 h-4 w-4 text-yellow-300 opacity-70" />

            {/* Main badge */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
              {badgeIcon ? (
                <span className="text-5xl">{badgeIcon}</span>
              ) : (
                <Award className="h-12 w-12 text-white" />
              )}
            </div>
          </div>

          {/* Badge name */}
          <h3 className="mb-2 text-center text-2xl font-bold text-white drop-shadow-md">
            {badgeName}
          </h3>

          {/* Badge description */}
          {badgeDescription && (
            <p className="mb-2 text-center text-sm text-white/80">
              {badgeDescription}
            </p>
          )}

          {/* Category tag */}
          {badgeCategory && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              {badgeCategory}
            </div>
          )}

          {/* Earned date */}
          {earnedAt && (
            <p className="mt-3 text-xs text-white/60">
              Earned {earnedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </ShareableCard>
    );
  }
);

BadgeCard.displayName = "BadgeCard";

export default BadgeCard;
