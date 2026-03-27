import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Twitter,
  Facebook,
  MessageCircle,
  Globe,
  Lock,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  shareContent,
  canUseNativeShare,
  formatAchievementText,
  SharePlatform,
} from "@/lib/shareUtils";
import { socialAPI, PostType, PostVisibility, PostContent } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "streak" | "badge" | "weekly" | "habit" | "cbt";
  data: Record<string, any>;
  cardComponent: ReactNode;
  userName?: string;
}

const visibilityOptions: Array<{
  value: PostVisibility;
  label: string;
  icon: typeof Globe;
}> = [
  { value: "public", label: "Public", icon: Globe },
  { value: "friends", label: "Followers", icon: Users },
  { value: "private", label: "Private", icon: Lock },
];

const ShareModal = ({
  isOpen,
  onClose,
  type,
  data,
  cardComponent,
  userName,
}: ShareModalProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<Record<string, "success" | "error" | null>>({});

  const defaultText = formatAchievementText(type, data);

  const mapTypeToPostType = (t: string): PostType => {
    switch (t) {
      case "streak":
        return "streak";
      case "badge":
        return "achievement";
      case "weekly":
        return "weekly_summary";
      case "habit":
        return "habit_score";
      case "cbt":
        return "cbt_milestone";
      default:
        return "achievement";
    }
  };

  const buildPostContent = (): PostContent => {
    const base: PostContent = {
      title: data.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Achievement`,
      description: caption || defaultText,
    };

    switch (type) {
      case "streak":
        base.streakDays = data.days || data.streakDays;
        break;
      case "badge":
        base.badgeId = data.id;
        base.badgeName = data.name;
        base.badgeIcon = data.icon;
        break;
      case "weekly":
        base.weeklyData = {
          daysTracked: data.daysTracked,
          consistencyScore: data.consistencyScore,
          avgCalories: data.avgCalories,
        };
        break;
      case "habit":
        base.habitScore = data.score || data.habitScore;
        break;
      case "cbt":
        base.cbtData = {
          moodsLogged: data.moodsLogged,
          exercisesCompleted: data.exercisesCompleted,
          moodImprovement: data.moodImprovement,
        };
        break;
    }

    return base;
  };

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      setIsSharing(true);
      setShareStatus((prev) => ({ ...prev, [platform]: null }));

      const shareData = {
        title: `Habeat - ${type.charAt(0).toUpperCase() + type.slice(1)} Achievement`,
        text: caption || defaultText,
        url: "https://habeat.app",
      };

      const element = cardRef.current?.querySelector("[data-shareable-card]") as HTMLElement | undefined;

      const result = await shareContent(platform, shareData, element || undefined);

      setShareStatus((prev) => ({
        ...prev,
        [platform]: result.success ? "success" : "error",
      }));

      if (result.success) {
        toast({
          title: "Shared!",
          description: result.message,
        });
      } else {
        toast({
          title: "Share failed",
          description: result.message,
          variant: "destructive",
        });
      }

      setIsSharing(false);

      // Reset status after 2 seconds
      setTimeout(() => {
        setShareStatus((prev) => ({ ...prev, [platform]: null }));
      }, 2000);
    },
    [caption, defaultText, type, toast]
  );

  const handlePostToFeed = useCallback(async () => {
    setIsSharing(true);

    try {
      await socialAPI.createPost({
        type: mapTypeToPostType(type),
        content: buildPostContent(),
        visibility,
        caption: caption || undefined,
      });

      toast({
        title: "Posted!",
        description: "Your achievement has been shared to your feed",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Failed to post",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  }, [type, visibility, caption, toast, onClose]);

  const ShareButton = ({
    platform,
    icon: Icon,
    label,
    color,
  }: {
    platform: SharePlatform;
    icon: typeof Twitter;
    label: string;
    color: string;
  }) => (
    <button
      onClick={() => handleShare(platform)}
      disabled={isSharing}
      className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:scale-105 ${color}`}
    >
      {shareStatus[platform] === "success" ? (
        <Check className="h-6 w-6 text-green-500" />
      ) : shareStatus[platform] === "error" ? (
        <X className="h-6 w-6 text-red-500" />
      ) : (
        <Icon className="h-6 w-6" />
      )}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-4 backdrop-blur-sm dark:bg-slate-900/95">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Share2 className="h-5 w-5 text-emerald-500" />
                Share Achievement
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Card Preview */}
              <div
                ref={cardRef}
                className="mb-6 flex justify-center"
                data-shareable-card
              >
                {cardComponent}
              </div>

              {/* Caption input */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add a caption (optional)
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={defaultText}
                  maxLength={280}
                  className="resize-none"
                  rows={3}
                />
                <p className="mt-1 text-right text-xs text-slate-500">
                  {caption.length}/280
                </p>
              </div>

              {/* Visibility selector */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Who can see this?
                </label>
                <div className="flex gap-2">
                  {visibilityOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setVisibility(value)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                        visibility === value
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post to feed button */}
              <Button
                onClick={handlePostToFeed}
                disabled={isSharing}
                className="mb-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              >
                {isSharing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                Post to Feed
              </Button>

              {/* Divider */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-500">or share externally</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-4 gap-2">
                {canUseNativeShare() && (
                  <ShareButton
                    platform="native"
                    icon={Share2}
                    label="Share"
                    color="bg-slate-100 dark:bg-slate-800"
                  />
                )}
                <ShareButton
                  platform="twitter"
                  icon={Twitter}
                  label="Twitter"
                  color="bg-sky-50 text-sky-500 dark:bg-sky-900/30"
                />
                <ShareButton
                  platform="facebook"
                  icon={Facebook}
                  label="Facebook"
                  color="bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                />
                <ShareButton
                  platform="whatsapp"
                  icon={MessageCircle}
                  label="WhatsApp"
                  color="bg-green-50 text-green-600 dark:bg-green-900/30"
                />
                <ShareButton
                  platform="download"
                  icon={Download}
                  label="Download"
                  color="bg-violet-50 text-violet-600 dark:bg-violet-900/30"
                />
                <ShareButton
                  platform="copy"
                  icon={Copy}
                  label="Copy"
                  color="bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
