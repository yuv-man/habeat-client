import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Flame,
  Target,
  Calendar,
  MessageSquare,
  Send,
} from "lucide-react";
import { useEngagementStore } from "@/stores/engagementStore";
import { useAuthStore } from "@/stores/authStore";
import { socialAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

type PostMode = "select" | "text" | "achievement";
type AchievementType = "streak" | "score" | "weekly";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<PostMode>("select");
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType>("streak");
  const [textContent, setTextContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const engagementStats = useEngagementStore((state) => state.stats);

  const resetAndClose = () => {
    setMode("select");
    setTextContent("");
    setSelectedAchievement("streak");
    onClose();
  };

  const handlePostText = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      await socialAPI.createPost({
        type: "text",
        content: {
          title: "Shared a thought",
          description: textContent.trim(),
        },
        visibility: "public",
      });

      toast({
        title: "Posted!",
        description: "Your post is now live",
      });
      onPostCreated?.();
      resetAndClose();
    } catch (error) {
      toast({
        title: "Failed to post",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostAchievement = async () => {
    if (!engagementStats) return;

    setIsPosting(true);
    try {
      const typeMap = { streak: "streak", score: "habit_score", weekly: "weekly_summary" } as const;

      const contentMap = {
        streak: {
          title: `${engagementStats.streak} Day Streak!`,
          description: `I've maintained a ${engagementStats.streak}-day tracking streak on Habeat!`,
          streakDays: engagementStats.streak,
        },
        score: {
          title: `Habit Score: ${engagementStats.habitScore}`,
          description: `My habit score is ${engagementStats.habitScore} points!`,
          habitScore: engagementStats.habitScore,
        },
        weekly: {
          title: `${engagementStats.weeklyConsistency}% Weekly Consistency`,
          description: `Achieved ${engagementStats.weeklyConsistency}% consistency this week!`,
          weeklyData: {
            daysTracked: engagementStats.weeklyGoalsHit,
            consistencyScore: engagementStats.weeklyConsistency,
          },
        },
      };

      await socialAPI.createPost({
        type: typeMap[selectedAchievement],
        content: contentMap[selectedAchievement],
        visibility: "public",
      });

      toast({
        title: "Posted!",
        description: "Your achievement is now live",
      });
      onPostCreated?.();
      resetAndClose();
    } catch (error) {
      toast({
        title: "Failed to post",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const achievements = [
    {
      id: "streak" as const,
      label: "Streak",
      value: engagementStats?.streak || 0,
      suffix: "days",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-300",
    },
    {
      id: "score" as const,
      label: "Score",
      value: engagementStats?.habitScore || 0,
      suffix: "pts",
      icon: Target,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-300",
    },
    {
      id: "weekly" as const,
      label: "Weekly",
      value: engagementStats?.weeklyConsistency || 0,
      suffix: "%",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">
                {mode === "select" && "Create Post"}
                {mode === "text" && "Share a Thought"}
                {mode === "achievement" && "Share Achievement"}
              </h3>
              <button
                onClick={resetAndClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Mode Selection */}
              {mode === "select" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setMode("text")}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Share a thought</p>
                      <p className="text-sm text-gray-500">Write something to the community</p>
                    </div>
                  </button>

                  {engagementStats && (
                    <button
                      onClick={() => setMode("achievement")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition"
                    >
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Flame className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Share achievement</p>
                        <p className="text-sm text-gray-500">Celebrate your streak, score, or progress</p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Text Post */}
              {mode === "text" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {user?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>

                  <Textarea
                    placeholder="What's on your mind? Share tips, encouragement, or your journey..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{textContent.length}/500</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMode("select")}
                      >
                        Back
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePostText}
                        disabled={isPosting || !textContent.trim()}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        {isPosting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievement Post */}
              {mode === "achievement" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-3">Select an achievement to share:</p>

                  <div className="grid grid-cols-3 gap-2">
                    {achievements.map((ach) => {
                      const Icon = ach.icon;
                      const isSelected = selectedAchievement === ach.id;
                      return (
                        <button
                          key={ach.id}
                          onClick={() => setSelectedAchievement(ach.id)}
                          className={`p-3 rounded-xl border-2 transition ${
                            isSelected
                              ? `${ach.bgColor} ${ach.borderColor}`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${ach.color}`} />
                          <p className={`text-lg font-bold ${isSelected ? ach.color : "text-gray-900"}`}>
                            {ach.value}
                          </p>
                          <p className="text-xs text-gray-500">{ach.suffix}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMode("select")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handlePostAchievement}
                      disabled={isPosting}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                      {isPosting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
