import { useState, useCallback, useRef } from "react";
import { Trophy, ImagePlus, Brain, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocialFeed } from "@/components/social";
import { useAuthStore } from "@/stores/authStore";
import { useSocialStore } from "@/stores/socialStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import CreatePostModal from "@/components/social/CreatePostModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PostMode = "goal" | "photo" | "mood" | "achievement";

const Social = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, token } = useAuthStore();
  const { createPost } = useSocialStore();

  const [modalMode, setModalMode] = useState<PostMode>("mood");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Inline composer state
  const [composerText, setComposerText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePostCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openModal = (mode: PostMode) => {
    setModalMode(mode);
    setShowModal(true);
  };

  const handleInlinePost = async () => {
    if (!composerText.trim()) return;
    setIsPosting(true);
    const author = user
      ? { _id: user._id!, name: user.name, profilePicture: user.profilePicture }
      : undefined;
    try {
      await createPost(
        {
          type: "mindful_moment",
          content: { title: composerText.trim(), description: composerText.trim() },
          caption: composerText.trim(),
          visibility: "public",
        },
        author
      );
      setComposerText("");
      toast({ title: "Posted!" });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setIsPosting(false); }
  };

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <MealLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f6] p-4 gap-4">
        <Users className="w-12 h-12 text-gray-300" />
        <p className="text-gray-400">Please log in to view the community.</p>
        <button onClick={() => navigate("/register")} className="px-6 py-3 bg-green-800 text-white rounded-full font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  return (
    <DashboardLayout currentView="daily" hidePlanBanner bgColor="bg-[#faf9f6]">
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">

        {/* Inline composer */}
        <section className="bg-white rounded-2xl p-5 shadow-[0_10px_40px_-10px_rgba(63,102,82,0.08)] border border-gray-100 border-b-4 border-b-green-800/10 mb-6">
          <div className="flex gap-3 mb-4">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-green-100 flex-shrink-0 overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-800 font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="What's on your mind?"
              rows={2}
              className="flex-1 bg-transparent border-none outline-none resize-none text-base text-gray-800 placeholder:text-gray-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {/* Chips */}
              <button
                onClick={() => openModal("goal")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-green-800/8 hover:bg-green-800/15 text-green-800 text-sm font-semibold transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Goal
              </button>
              <button
                onClick={() => openModal("photo")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#5f5a80]/8 hover:bg-[#5f5a80]/15 text-[#5f5a80] text-sm font-semibold transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                Photo
              </button>
              <button
                onClick={() => openModal("mood")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-semibold transition-colors"
              >
                <Brain className="w-4 h-4" />
                Mood
              </button>
            </div>

            {/* Post button — only visible when there's text */}
            {composerText.trim() && (
              <button
                onClick={handleInlinePost}
                disabled={isPosting}
                className={cn(
                  "px-5 py-2 bg-green-800 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-all active:scale-95",
                  isPosting && "opacity-60"
                )}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            )}
          </div>
        </section>

        {/* Feed */}
        <SocialFeed refreshKey={refreshKey} />
      </div>

      {/* FAB for quick post */}
      <button
        onClick={() => openModal("mood")}
        className="fixed bottom-24 right-5 w-14 h-14 bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 hover:scale-105 active:scale-90 transition-all z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPostCreated={handlePostCreated}
        initialMode={modalMode}
      />
    </DashboardLayout>
  );
};

export default Social;
