import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Copy,
  Check,
  Loader2,
  Flame,
  Target,
  Calendar,
} from "lucide-react";
import { useEngagementStore } from "@/stores/engagementStore";
import { useAuthStore } from "@/stores/authStore";
import {
  shareContent,
  canUseNativeShare,
  formatAchievementText,
  SharePlatform,
} from "@/lib/shareUtils";
import { socialAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { StreakCard, HabitScoreCard, WeeklySummaryCard } from "./cards";

// Simple social icons as SVG (smaller size)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

type AchievementTab = "streak" | "score" | "weekly";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AchievementTab;
}

const SharePopup = ({ isOpen, onClose, initialTab = "streak" }: SharePopupProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<AchievementTab>(initialTab);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = useAuthStore((state) => state.user);
  const engagementStats = useEngagementStore((state) => state.stats);

  // Sync activeTab with initialTab when popup opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!engagementStats) return null;

  const achievements = {
    streak: {
      label: "Streak",
      icon: Flame,
      value: engagementStats.streak,
      suffix: "days",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    score: {
      label: "Score",
      icon: Target,
      value: engagementStats.habitScore,
      suffix: "pts",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    weekly: {
      label: "Weekly",
      icon: Calendar,
      value: engagementStats.weeklyConsistency,
      suffix: "%",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  };

  const currentAchievement = achievements[activeTab];

  const getShareText = () => {
    switch (activeTab) {
      case "streak":
        return formatAchievementText("streak", { days: engagementStats.streak });
      case "score":
        return formatAchievementText("habit", { score: engagementStats.habitScore });
      case "weekly":
        return formatAchievementText("weekly", {
          daysTracked: engagementStats.weeklyGoalsHit,
          consistencyScore: engagementStats.weeklyConsistency,
        });
    }
  };

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true);

    const shareData = {
      title: "My Habeat Progress",
      text: getShareText(),
      url: "https://habeat.app",
    };

    const element = cardRef.current;
    const result = await shareContent(platform, shareData, element || undefined);

    if (result.success) {
      if (platform === "copy") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast({
        title: platform === "copy" ? "Copied!" : "Shared!",
        description: result.message,
      });
    }

    setIsSharing(false);
  };

  const handlePostToFeed = async () => {
    setIsSharing(true);
    try {
      const typeMap = { streak: "streak", score: "habit_score", weekly: "weekly_summary" } as const;

      await socialAPI.createPost({
        type: typeMap[activeTab],
        content: {
          title: `${currentAchievement.value}${currentAchievement.suffix} ${currentAchievement.label}`,
          description: getShareText(),
          ...(activeTab === "streak" && { streakDays: engagementStats.streak }),
          ...(activeTab === "score" && { habitScore: engagementStats.habitScore }),
          ...(activeTab === "weekly" && {
            weeklyData: {
              daysTracked: engagementStats.weeklyGoalsHit,
              consistencyScore: engagementStats.weeklyConsistency,
            },
          }),
        },
        visibility: "public",
      });

      toast({
        title: "Posted!",
        description: "Shared to your feed",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderCard = () => {
    switch (activeTab) {
      case "streak":
        return (
          <StreakCard
            streakDays={engagementStats.streak}
            longestStreak={engagementStats.longestStreak}
            userName={user?.name}
          />
        );
      case "score":
        return (
          <HabitScoreCard
            habitScore={engagementStats.habitScore}
            totalDaysTracked={engagementStats.totalDaysTracked}
            totalMealsLogged={engagementStats.totalMealsLogged}
            userName={user?.name}
          />
        );
      case "weekly":
        return (
          <WeeklySummaryCard
            daysTracked={engagementStats.weeklyGoalsHit}
            consistencyScore={engagementStats.weeklyConsistency}
            userName={user?.name}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Share Progress</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Achievement Tabs */}
            <div className="flex gap-2 px-5 py-3 bg-gray-50">
              {(Object.keys(achievements) as AchievementTab[]).map((key) => {
                const ach = achievements[key];
                const Icon = ach.icon;
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? `${ach.bgColor} ${ach.color} ${ach.borderColor} border`
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{ach.value}</span>
                  </button>
                );
              })}
            </div>

            {/* Card Preview */}
            <div className="px-5 py-4 flex justify-center" ref={cardRef}>
              <div className="transform scale-[0.75] origin-center">
                {renderCard()}
              </div>
            </div>

            {/* Share Options */}
            <div className="px-5 pb-5">
              {/* Post to Community - Primary action */}
              <button
                onClick={handlePostToFeed}
                disabled={isSharing}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition flex items-center justify-center gap-2 mb-3"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Post to Community</>
                )}
              </button>

              {/* External share icons - smaller, just logos */}
              <div className="flex items-center justify-center gap-2">
                {/* Native Share (if available) */}
                {canUseNativeShare() && (
                  <button
                    onClick={() => handleShare("native")}
                    disabled={isSharing}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                    title="Share"
                  >
                    <ShareIcon />
                  </button>
                )}

                {/* Twitter */}
                <button
                  onClick={() => handleShare("twitter")}
                  disabled={isSharing}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                  title="Twitter"
                >
                  <TwitterIcon />
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare("facebook")}
                  disabled={isSharing}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                  title="Facebook"
                >
                  <FacebookIcon />
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShare("whatsapp")}
                  disabled={isSharing}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                  title="WhatsApp"
                >
                  <WhatsAppIcon />
                </button>

                {/* Download */}
                <button
                  onClick={() => handleShare("download")}
                  disabled={isSharing}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                  title="Save image"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Copy */}
                <button
                  onClick={() => handleShare("copy")}
                  disabled={isSharing}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
                  title="Copy text"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharePopup;
