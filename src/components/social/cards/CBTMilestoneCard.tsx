import { forwardRef } from "react";
import { Brain, Heart, Sparkles, TrendingUp } from "lucide-react";
import ShareableCard from "./ShareableCard";

interface CBTMilestoneCardProps {
  moodsLogged: number;
  exercisesCompleted: number;
  moodImprovement?: number; // percentage improvement
  thoughtsReframed?: number;
  userName?: string;
  milestoneType?: "first_mood" | "exercises_10" | "mood_improvement" | "consistency" | "general";
}

const CBTMilestoneCard = forwardRef<HTMLDivElement, CBTMilestoneCardProps>(
  (
    {
      moodsLogged,
      exercisesCompleted,
      moodImprovement,
      thoughtsReframed,
      userName,
      milestoneType = "general",
    },
    ref
  ) => {
    const getMilestoneInfo = () => {
      switch (milestoneType) {
        case "first_mood":
          return {
            title: "First Step Taken!",
            subtitle: "Started the mindfulness journey",
            emoji: "",
            gradient: "from-emerald-500 to-teal-600",
          };
        case "exercises_10":
          return {
            title: "Exercise Champion!",
            subtitle: "Completed 10+ mindfulness exercises",
            emoji: "",
            gradient: "from-purple-500 to-indigo-600",
          };
        case "mood_improvement":
          return {
            title: "Mood Master!",
            subtitle: "Significant mood improvement achieved",
            emoji: "",
            gradient: "from-amber-500 to-orange-600",
          };
        case "consistency":
          return {
            title: "Consistency King!",
            subtitle: "Regular mindfulness practice",
            emoji: "",
            gradient: "from-rose-500 to-pink-600",
          };
        default:
          return {
            title: "Mindfulness Journey",
            subtitle: "Progress in mental wellness",
            emoji: "",
            gradient: "from-violet-500 to-purple-600",
          };
      }
    };

    const { title, subtitle, emoji, gradient } = getMilestoneInfo();

    return (
      <ShareableCard ref={ref} gradient={gradient}>
        {/* Header */}
        {userName && (
          <p className="mb-1 text-sm font-medium text-white/80">{userName}</p>
        )}

        {/* Milestone badge */}
        <div className="mb-4 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute -inset-3 rounded-full bg-white/20 blur-lg" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
              <span className="text-4xl">{emoji}</span>
            </div>
          </div>

          <h3 className="text-center text-2xl font-bold text-white drop-shadow-md">
            {title}
          </h3>
          <p className="text-center text-sm text-white/80">{subtitle}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Moods logged */}
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">Moods Logged</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{moodsLogged}</p>
          </div>

          {/* Exercises completed */}
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">Exercises</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{exercisesCompleted}</p>
          </div>

          {/* Mood improvement */}
          {moodImprovement !== undefined && (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Mood Boost</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                +{moodImprovement}%
              </p>
            </div>
          )}

          {/* Thoughts reframed */}
          {thoughtsReframed !== undefined && (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Reframed</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{thoughtsReframed}</p>
            </div>
          )}
        </div>

        {/* Motivational footer */}
        <div className="mt-4 text-center">
          <p className="text-sm italic text-white/70">
            "Every mood logged is a step toward self-awareness"
          </p>
        </div>
      </ShareableCard>
    );
  }
);

CBTMilestoneCard.displayName = "CBTMilestoneCard";

export default CBTMilestoneCard;
