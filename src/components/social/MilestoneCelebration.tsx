import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Flame, Target, Award, Calendar, Brain } from "lucide-react";
import confetti from "canvas-confetti";
import { useEngagementStore } from "@/stores/engagementStore";
import { useAuthStore } from "@/stores/authStore";
import { useCBTStore } from "@/stores/cbtStore";
import { Button } from "@/components/ui/button";
import ShareModal from "@/components/modals/ShareModal";
import {
  StreakCard,
  HabitScoreCard,
  BadgeCard,
  CBTMilestoneCard,
} from "./cards";

type MilestoneType = "streak" | "habit" | "badge" | "cbt";

interface Milestone {
  type: MilestoneType;
  title: string;
  subtitle: string;
  icon: typeof Flame;
  gradient: string;
  data: Record<string, any>;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];
const HABIT_SCORE_MILESTONES = [25, 50, 75, 90];
const CBT_MILESTONES = [1, 5, 10, 25, 50];

const STORAGE_KEY = "habeat_celebrated_milestones";

const MilestoneCelebration = () => {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [celebratedMilestones, setCelebratedMilestones] = useState<string[]>([]);

  const user = useAuthStore((state) => state.user);
  const engagementStats = useEngagementStore((state) => state.stats);
  const { todayMoodEntries } = useCBTStore();

  // Load celebrated milestones from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCelebratedMilestones(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load celebrated milestones:", e);
    }
  }, []);

  // Save celebrated milestone
  const markAsCelebrated = useCallback((milestoneKey: string) => {
    setCelebratedMilestones((prev) => {
      const updated = [...prev, milestoneKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Trigger confetti
  const triggerConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Check for milestones
  useEffect(() => {
    if (!engagementStats || !user) return;

    // Check streak milestones
    const streakMilestone = STREAK_MILESTONES.find(
      (m) => engagementStats.streak === m
    );
    if (streakMilestone) {
      const key = `streak_${streakMilestone}`;
      if (!celebratedMilestones.includes(key)) {
        setCurrentMilestone({
          type: "streak",
          title: `${streakMilestone}-Day Streak!`,
          subtitle: streakMilestone >= 30
            ? "Incredible dedication!"
            : "You're on fire!",
          icon: Flame,
          gradient: "from-orange-500 to-red-500",
          data: {
            days: streakMilestone,
            streakDays: streakMilestone,
            longestStreak: engagementStats.longestStreak,
          },
        });
        triggerConfetti();
        return;
      }
    }

    // Check habit score milestones
    const habitMilestone = HABIT_SCORE_MILESTONES.find(
      (m) => engagementStats.habitScore >= m && engagementStats.habitScore < m + 5
    );
    if (habitMilestone) {
      const key = `habit_${habitMilestone}`;
      if (!celebratedMilestones.includes(key)) {
        setCurrentMilestone({
          type: "habit",
          title: `Habit Score ${habitMilestone}+!`,
          subtitle: habitMilestone >= 75
            ? "You're a habit master!"
            : "Building great habits!",
          icon: Target,
          gradient: "from-emerald-500 to-green-600",
          data: {
            score: engagementStats.habitScore,
            habitScore: engagementStats.habitScore,
            totalDaysTracked: engagementStats.totalDaysTracked,
            totalMealsLogged: engagementStats.totalMealsLogged,
          },
        });
        triggerConfetti();
        return;
      }
    }

    // Check new badges
    if (engagementStats.badges.length > 0) {
      const latestBadge = engagementStats.badges[engagementStats.badges.length - 1];
      const key = `badge_${latestBadge.id}`;
      if (!celebratedMilestones.includes(key)) {
        setCurrentMilestone({
          type: "badge",
          title: latestBadge.name,
          subtitle: "New badge earned!",
          icon: Award,
          gradient: "from-purple-500 to-pink-500",
          data: {
            id: latestBadge.id,
            name: latestBadge.name,
            icon: latestBadge.icon,
            description: latestBadge.description,
          },
        });
        triggerConfetti();
        return;
      }
    }
  }, [engagementStats, user, celebratedMilestones, triggerConfetti]);

  // Check CBT milestones
  useEffect(() => {
    if (!todayMoodEntries || todayMoodEntries.length === 0) return;

    const totalMoodsLogged = todayMoodEntries.length;
    const cbtMilestone = CBT_MILESTONES.find((m) => totalMoodsLogged === m);

    if (cbtMilestone) {
      const key = `cbt_mood_${cbtMilestone}`;
      if (!celebratedMilestones.includes(key)) {
        setCurrentMilestone({
          type: "cbt",
          title: cbtMilestone === 1 ? "First Mood Logged!" : `${cbtMilestone} Moods Logged!`,
          subtitle: "Your mindfulness journey continues!",
          icon: Brain,
          gradient: "from-violet-500 to-purple-600",
          data: {
            moodsLogged: totalMoodsLogged,
            exercisesCompleted: 0,
            milestoneType: cbtMilestone === 1 ? "first_mood" : "general",
          },
        });
        triggerConfetti();
      }
    }
  }, [todayMoodEntries, celebratedMilestones, triggerConfetti]);

  const handleDismiss = () => {
    if (currentMilestone) {
      const key = `${currentMilestone.type}_${
        currentMilestone.type === "streak"
          ? currentMilestone.data.days
          : currentMilestone.type === "habit"
            ? Math.floor(currentMilestone.data.score / 5) * 5
            : currentMilestone.type === "badge"
              ? currentMilestone.data.id
              : currentMilestone.data.moodsLogged
      }`;
      markAsCelebrated(key);
    }
    setCurrentMilestone(null);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const renderShareCard = () => {
    if (!currentMilestone || !user) return null;

    switch (currentMilestone.type) {
      case "streak":
        return (
          <StreakCard
            streakDays={currentMilestone.data.streakDays}
            longestStreak={currentMilestone.data.longestStreak}
            userName={user.name}
          />
        );
      case "habit":
        return (
          <HabitScoreCard
            habitScore={currentMilestone.data.habitScore}
            totalDaysTracked={currentMilestone.data.totalDaysTracked}
            totalMealsLogged={currentMilestone.data.totalMealsLogged}
            userName={user.name}
          />
        );
      case "badge":
        return (
          <BadgeCard
            badgeName={currentMilestone.data.name}
            badgeDescription={currentMilestone.data.description}
            badgeIcon={currentMilestone.data.icon}
            userName={user.name}
          />
        );
      case "cbt":
        return (
          <CBTMilestoneCard
            moodsLogged={currentMilestone.data.moodsLogged}
            exercisesCompleted={currentMilestone.data.exercisesCompleted}
            milestoneType={currentMilestone.data.milestoneType}
            userName={user.name}
          />
        );
      default:
        return null;
    }
  };

  if (!currentMilestone) return null;

  const Icon = currentMilestone.icon;

  return (
    <>
      <AnimatePresence>
        {currentMilestone && !shareModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm"
          >
            <div
              className={`rounded-2xl bg-gradient-to-r ${currentMilestone.gradient} p-4 shadow-2xl`}
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {currentMilestone.title}
                  </h3>
                  <p className="text-sm text-white/80 mb-3">
                    {currentMilestone.subtitle}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleShare}
                      size="sm"
                      className="bg-white text-gray-900 hover:bg-white/90 flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-1.5" />
                      Share
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      Later
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {currentMilestone && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            handleDismiss();
          }}
          type={currentMilestone.type === "badge" ? "badge" : currentMilestone.type}
          data={currentMilestone.data}
          cardComponent={renderShareCard()}
          userName={user?.name}
        />
      )}
    </>
  );
};

export default MilestoneCelebration;
