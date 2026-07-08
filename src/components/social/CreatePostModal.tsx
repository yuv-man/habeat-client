import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Flame, Target, Calendar, Send, Trophy, ImagePlus, Brain, XCircle } from "lucide-react";
import { useEngagementStore } from "@/stores/engagementStore";
import { useAuthStore } from "@/stores/authStore";
import { useSocialStore } from "@/stores/socialStore";
import { pickFromGallery } from "@/services/cameraService";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Image picker sub-component ──────────────────────────────────────────────

interface ImagePickerProps {
  imageBase64: string | null;
  imageFormat: string;
  onPick: () => void;
  onRemove: () => void;
  loading: boolean;
  optional?: boolean;
}

function ImagePicker({ imageBase64, imageFormat, onPick, onRemove, loading, optional }: ImagePickerProps) {
  if (imageBase64) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={`data:image/${imageFormat};base64,${imageBase64}`}
          alt="Selected"
          className="w-full h-44 object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition"
        >
          <XCircle className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onPick}
      disabled={loading}
      className="w-full h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      ) : (
        <>
          <ImagePlus className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-400 font-medium">
            {optional ? "Add photo (optional)" : "Tap to add photo"}
          </span>
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  initialMode?: PostMode;
}

type PostMode = "goal" | "photo" | "mood" | "achievement";

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialMode }: CreatePostModalProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<PostMode>(initialMode || "mood");
  const [textContent, setTextContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState("jpeg");
  const [healthScore, setHealthScore] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<"streak" | "score" | "weekly">("streak");
  const [isPosting, setIsPosting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const engagementStats = useEngagementStore((state) => state.stats);
  const createPost = useSocialStore((state) => state.createPost);

  const resetAndClose = () => {
    setTextContent("");
    setImageBase64(null);
    setHealthScore("");
    setMode(initialMode || "mood");
    onClose();
  };

  const handlePickImage = async () => {
    setIsPickingImage(true);
    try {
      const result = await pickFromGallery();
      setImageBase64(result.base64);
      setImageFormat(result.format);
    } catch (e) {
      if ((e as Error).message !== "Cancelled") {
        toast({ title: "Could not load image", description: (e as Error).message, variant: "destructive" });
      }
    } finally { setIsPickingImage(false); }
  };

  const post = async (type: string, content: Record<string, any>, caption?: string) => {
    setIsPosting(true);
    const author = user
      ? { _id: user._id!, name: user.name, profilePicture: user.profilePicture }
      : undefined;
    try {
      await createPost(
        { type: type as any, content: { title: caption || type, ...content }, caption, visibility: "public" },
        author
      );
      toast({ title: "Posted!", description: "Your post is now live" });
      onPostCreated?.();
      resetAndClose();
    } catch (e) {
      toast({ title: "Failed to post", description: (e as Error).message, variant: "destructive" });
    } finally { setIsPosting(false); }
  };

  const imageDataUri = imageBase64 ? `data:image/${imageFormat};base64,${imageBase64}` : undefined;

  const handleGoalPost = () => {
    if (!textContent.trim()) return;
    post("goal_reached", { description: textContent.trim(), imageUrl: imageDataUri }, textContent.trim());
  };

  const handlePhotoPost = () => {
    if (!imageBase64) return;
    const score = parseInt(healthScore);
    post("meal_share", {
      description: textContent.trim() || "Sharing a meal",
      imageUrl: imageDataUri,
      healthScore: !isNaN(score) ? score : undefined,
    }, textContent.trim() || undefined);
  };

  const handleMoodPost = () => {
    if (!textContent.trim()) return;
    post("mindful_moment", { description: textContent.trim() }, textContent.trim());
  };

  const handleAchievementPost = async () => {
    if (!engagementStats) return;
    const typeMap = { streak: "streak", score: "habit_score", weekly: "weekly_summary" } as const;
    const contentMap = {
      streak: { title: `${engagementStats.streak} Day Streak!`, description: `Maintaining a ${engagementStats.streak}-day streak!`, streakDays: engagementStats.streak },
      score:  { title: `Habit Score: ${engagementStats.habitScore}`, habitScore: engagementStats.habitScore },
      weekly: { title: `${engagementStats.weeklyConsistency}% Weekly`, weeklyData: { daysTracked: engagementStats.weeklyGoalsHit, consistencyScore: engagementStats.weeklyConsistency } },
    };
    const author = user
      ? { _id: user._id!, name: user.name, profilePicture: user.profilePicture }
      : undefined;
    setIsPosting(true);
    try {
      await createPost({ type: typeMap[selectedAchievement], content: contentMap[selectedAchievement], visibility: "public" }, author);
      toast({ title: "Posted!" });
      onPostCreated?.();
      resetAndClose();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally { setIsPosting(false); }
  };

  const tabs: { id: PostMode; label: string; icon: typeof Flame; color: string }[] = [
    { id: "goal",        label: "Goal",        icon: Trophy,  color: "text-green-800" },
    { id: "photo",       label: "Meal Photo",  icon: ImagePlus, color: "text-[#5f5a80]" },
    { id: "mood",        label: "Mood",        icon: Brain,   color: "text-violet-600" },
    { id: "achievement", label: "Achievement", icon: Flame,   color: "text-orange-500" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm pb-20 sm:pb-0 px-4 pt-4"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Share with Community</h3>
              <button onClick={resetAndClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                      mode === tab.id ? `bg-gray-900 text-white` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 space-y-4">
              {/* User avatar row */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
              </div>

              {/* Goal mode */}
              {mode === "goal" && (
                <>
                  <Textarea
                    placeholder="What goal did you reach? Share your win..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[100px] resize-none rounded-2xl border-gray-200"
                    maxLength={500}
                  />
                  <ImagePicker imageBase64={imageBase64} imageFormat={imageFormat} onPick={handlePickImage} onRemove={() => setImageBase64(null)} loading={isPickingImage} optional />
                  <button onClick={handleGoalPost} disabled={isPosting || !textContent.trim()}
                    className="w-full py-3 bg-green-800 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Share Goal</>}
                  </button>
                </>
              )}

              {/* Photo/Meal mode */}
              {mode === "photo" && (
                <>
                  <Textarea
                    placeholder="Tell us about this meal..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[80px] resize-none rounded-2xl border-gray-200"
                    maxLength={280}
                  />
                  <ImagePicker imageBase64={imageBase64} imageFormat={imageFormat} onPick={handlePickImage} onRemove={() => setImageBase64(null)} loading={isPickingImage} />
                  <Input placeholder="Health score (optional, e.g. 92)" value={healthScore} onChange={(e) => setHealthScore(e.target.value)} type="number" min={0} max={100} className="rounded-2xl border-gray-200 text-sm" />
                  <button onClick={handlePhotoPost} disabled={isPosting || !imageBase64}
                    className="w-full py-3 bg-[#5f5a80] disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Share Meal</>}
                  </button>
                </>
              )}

              {/* Mood/Mindful mode */}
              {mode === "mood" && (
                <>
                  <Textarea
                    placeholder="Share a mindful moment or insight from today..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[120px] resize-none rounded-2xl border-gray-200 italic"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 -mt-2">This will appear as a featured quote in the feed.</p>
                  <button onClick={handleMoodPost} disabled={isPosting || !textContent.trim()}
                    className="w-full py-3 bg-violet-600 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold text-sm hover:bg-violet-700 transition flex items-center justify-center gap-2">
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Share Moment</>}
                  </button>
                </>
              )}

              {/* Achievement mode */}
              {mode === "achievement" && engagementStats && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "streak" as const, label: "Streak", value: `${engagementStats.streak}d`, icon: Flame, color: "text-orange-500 bg-orange-50 border-orange-200" },
                      { id: "score" as const,  label: "Score",  value: `${engagementStats.habitScore}`, icon: Target, color: "text-green-600 bg-green-50 border-green-200" },
                      { id: "weekly" as const, label: "Weekly", value: `${engagementStats.weeklyConsistency}%`, icon: Calendar, color: "text-blue-600 bg-blue-50 border-blue-200" },
                    ]).map((a) => {
                      const Icon = a.icon;
                      const isSelected = selectedAchievement === a.id;
                      return (
                        <button key={a.id} onClick={() => setSelectedAchievement(a.id)}
                          className={cn("p-3 rounded-xl border-2 transition text-center", isSelected ? a.color : "border-gray-200 bg-white")}>
                          <Icon className={cn("w-5 h-5 mx-auto mb-1", isSelected ? a.color.split(" ")[0] : "text-gray-400")} />
                          <p className="text-lg font-bold text-gray-900">{a.value}</p>
                          <p className="text-xs text-gray-400">{a.label}</p>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={handleAchievementPost} disabled={isPosting}
                    className="w-full py-3 bg-orange-500 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl font-semibold text-sm hover:bg-orange-600 transition flex items-center justify-center gap-2">
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Share Achievement</>}
                  </button>
                </>
              )}
              {mode === "achievement" && !engagementStats && (
                <p className="text-sm text-gray-400 text-center py-4">Track your progress first to share achievements.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
