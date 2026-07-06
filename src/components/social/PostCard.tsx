import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Trash2, Send, Trophy, Utensils, Brain, Flame, Award, Calendar, Target, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ISocialPost } from "@/services/api";
import { useSocialStore } from "@/stores/socialStore";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: ISocialPost;
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  goal_reached:   { label: "Goal Reached",    color: "text-green-800 bg-green-800/10" },
  meal_share:     { label: "Meal Share",       color: "text-[#5f5a80] bg-[#5f5a80]/10" },
  mindful_moment: { label: "Mindful Moment",   color: "text-violet-600 bg-violet-100" },
  streak:         { label: "Streak",           color: "text-orange-600 bg-orange-50" },
  achievement:    { label: "Achievement",      color: "text-purple-600 bg-purple-50" },
  weekly_summary: { label: "Weekly Summary",   color: "text-blue-600 bg-blue-50" },
  habit_score:    { label: "Habit Score",      color: "text-green-600 bg-green-50" },
  cbt_milestone:  { label: "CBT Milestone",    color: "text-pink-600 bg-pink-50" },
  text:           { label: "Post",             color: "text-gray-500 bg-gray-100" },
};

const TYPE_ICONS: Record<string, typeof Heart> = {
  goal_reached:   Trophy,
  meal_share:     Utensils,
  mindful_moment: Brain,
  streak:         Flame,
  achievement:    Award,
  weekly_summary: Calendar,
  habit_score:    Target,
  cbt_milestone:  Brain,
  text:           MessageSquare,
};

const PostCard = ({ post }: PostCardProps) => {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { toggleLike, addComment, deleteComment, deletePost, trackShare } = useSocialStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const postUser = post.userId || { _id: "", name: "Unknown", profilePicture: "" };
  const postUserId = typeof postUser === "string" ? postUser : postUser._id;
  const postUserName = typeof postUser === "string" ? "User" : (postUser.name || "User");
  const postUserPicture = typeof postUser === "string" ? "" : (postUser.profilePicture || "");
  const isOwner = user?._id === postUserId;

  const meta = TYPE_META[post.type] || TYPE_META.text;
  const TypeIcon = TYPE_ICONS[post.type] || MessageSquare;
  const isMindful = post.type === "mindful_moment";

  const handleLike = async () => {
    try { await toggleLike(post._id); }
    catch (e) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addComment(post._id, commentText);
      setCommentText("");
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setIsSubmittingComment(false); }
  };

  const handleShare = async () => {
    try {
      await trackShare(post._id);
      if (navigator.share) {
        await navigator.share({ title: post.content.title, text: post.caption || post.content.description, url: `${window.location.origin}/social/post/${post._id}` });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/social/post/${post._id}`);
        toast({ title: "Link copied!" });
      }
    } catch (e) { if ((e as Error).name !== "AbortError") toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      toast({ title: "Post deleted" });
    } catch (e) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
  };

  // Stacked avatars from likes (show up to 2 + count)
  const likedBy = post.likes?.slice(0, 2) || [];
  const extraLikes = Math.max(0, (post.likesCount || 0) - 2);

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(63,102,82,0.08)] border border-gray-100 border-b-4 border-b-green-800/10 flex flex-col",
    )}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 overflow-hidden flex-shrink-0">
              {postUserPicture ? (
                <img src={postUserPicture} alt={postUserName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-800 font-bold text-sm">
                  {postUserName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{postUserName}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} · {meta.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Health score badge for meal share */}
            {post.type === "meal_share" && post.content.healthScore != null && (
              <div className="px-3 py-1 rounded-full bg-green-800/8 border border-green-800/15 text-green-800 text-xs font-bold">
                {post.content.healthScore} Score
              </div>
            )}
            {/* Type icon for other types */}
            {post.type !== "meal_share" && (
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", meta.color)}>
                <TypeIcon className="w-4 h-4" />
              </div>
            )}
            {isOwner && (
              <button onClick={handleDelete} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Caption / text */}
        {isMindful ? (
          <blockquote className="mt-1 mb-2">
            <p className="text-lg font-semibold text-green-800 italic leading-relaxed">
              "{post.caption || post.content.description}"
            </p>
          </blockquote>
        ) : (
          (post.caption || post.content.description) && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {post.caption || post.content.description}
            </p>
          )
        )}
      </div>

      {/* Image */}
      {post.content.imageUrl && (
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img src={post.content.imageUrl} alt={post.content.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Streak / habit_score / legacy content */}
      {["streak", "achievement", "weekly_summary", "habit_score", "cbt_milestone"].includes(post.type) && (
        <div className="px-5 pb-3">
          {post.type === "streak" && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <Flame className="w-7 h-7 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">{post.content.streakDays} day streak</span>
            </div>
          )}
          {post.type === "achievement" && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <Award className="w-7 h-7 text-purple-500" />
              <span className="font-semibold text-gray-900">{post.content.badgeName || post.content.title}</span>
            </div>
          )}
          {post.type === "habit_score" && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Target className="w-7 h-7 text-green-600" />
              <span className="text-xl font-bold text-green-700">{post.content.habitScore} pts</span>
            </div>
          )}
          {post.type === "weekly_summary" && post.content.weeklyData && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Days", value: post.content.weeklyData.daysTracked ?? 0 },
                { label: "Consistency", value: `${post.content.weeklyData.consistencyScore ?? 0}%` },
                { label: "Avg Cal", value: post.content.weeklyData.avgCalories ?? 0 },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className={cn(
        "px-4 py-3 flex items-center border-t border-gray-100 mt-auto",
        isMindful ? "justify-between" : "justify-around"
      )}>
        {/* Mindful moment: stacked avatars left, actions right */}
        {isMindful && likedBy.length > 0 && (
          <div className="flex -space-x-2">
            {likedBy.map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-green-100" />
            ))}
            {extraLikes > 0 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                <span className="text-[9px] font-bold text-gray-500">+{extraLikes}</span>
              </div>
            )}
          </div>
        )}
        {isMindful && likedBy.length === 0 && <div />}

        <div className={cn("flex items-center", isMindful ? "gap-3" : "gap-0 justify-around w-full")}>
          {/* Beat (like) */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 py-2 px-3 rounded-full transition-all active:scale-90",
              post.isLiked
                ? "text-green-800 bg-green-800/5"
                : "text-gray-400 hover:text-green-800 hover:bg-green-800/5"
            )}
          >
            <Heart className={cn("w-5 h-5 transition-all", post.isLiked && "fill-current scale-110")} />
            <span className="text-sm font-semibold">
              {post.likesCount > 0 ? `${post.likesCount} ` : ""}Beat{post.likesCount !== 1 ? "s" : ""}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-full text-gray-400 hover:text-green-800 hover:bg-green-800/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {post.commentsCount > 0 ? post.commentsCount : "Comment"}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 py-2 px-3 rounded-full text-gray-400 hover:text-green-800 hover:bg-green-800/5 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Share</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1 rounded-full border-gray-200 text-sm"
                />
                <Button onClick={handleComment} disabled={!commentText.trim() || isSubmittingComment} size="icon" className="rounded-full bg-green-800 hover:bg-green-700 w-9 h-9">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {post.comments.map((comment) => {
                const cu = comment.userId || { _id: "", name: "User", profilePicture: "" };
                const cuId = typeof cu === "string" ? cu : cu._id;
                const cuName = typeof cu === "string" ? "User" : (cu.name || "User");
                const cuPic = typeof cu === "string" ? "" : (cu.profilePicture || "");
                return (
                  <div key={comment._id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {cuPic ? <img src={cuPic} alt={cuName} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{cuName.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-gray-900">{cuName}</p>
                        {(user?._id === cuId || isOwner) && (
                          <button onClick={() => deleteComment(post._id, comment._id)} className="text-gray-300 hover:text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;
