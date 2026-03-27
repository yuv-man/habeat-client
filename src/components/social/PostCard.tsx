import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Send,
  Flame,
  Award,
  Calendar,
  Target,
  Brain,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ISocialPost, PostType } from "@/services/api";
import { useSocialStore } from "@/stores/socialStore";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: ISocialPost;
}

const typeIcons: Record<string, typeof Flame> = {
  streak: Flame,
  achievement: Award,
  weekly_summary: Calendar,
  habit_score: Target,
  cbt_milestone: Brain,
  text: MessageCircle,
};

const typeColors: Record<string, string> = {
  streak: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  achievement: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  weekly_summary: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  habit_score: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  cbt_milestone: "text-pink-500 bg-pink-50 dark:bg-pink-900/20",
  text: "text-gray-500 bg-gray-50 dark:bg-gray-900/20",
};

const PostCard = ({ post }: PostCardProps) => {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { toggleLike, addComment, deleteComment, deletePost, trackShare } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Handle cases where userId might not be populated
  const postUser = post.userId || { _id: "", name: "Unknown", profilePicture: "" };
  const postUserId = typeof postUser === "string" ? postUser : postUser._id;
  const postUserName = typeof postUser === "string" ? "User" : (postUser.name || "User");
  const postUserPicture = typeof postUser === "string" ? "" : (postUser.profilePicture || "");

  const isOwner = user?._id === postUserId;
  const Icon = typeIcons[post.type] || Award;

  const handleLike = async () => {
    try {
      await toggleLike(post._id);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addComment(post._id, commentText);
      setCommentText("");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(post._id, commentId);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await trackShare(post._id);
      if (navigator.share) {
        await navigator.share({
          title: post.content.title,
          text: post.caption || post.content.description,
          url: `${window.location.origin}/social/post/${post._id}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/social/post/${post._id}`
        );
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  const renderPostContent = () => {
    const { content, type } = post;

    switch (type) {
      case "streak":
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {content.streakDays} days
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Streak achieved!
              </p>
            </div>
          </div>
        );

      case "achievement":
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
              {content.badgeIcon ? (
                <span className="text-2xl">{content.badgeIcon}</span>
              ) : (
                <Award className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {content.badgeName || content.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Badge earned
              </p>
            </div>
          </div>
        );

      case "weekly_summary":
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {content.weeklyData?.daysTracked || 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Days</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-emerald-600">
                {content.weeklyData?.consistencyScore || 0}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Consistency</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-blue-600">
                {content.weeklyData?.avgCalories || 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Avg Cal</p>
            </div>
          </div>
        );

      case "habit_score":
        return (
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${((content.habitScore || 0) / 100) * 100} 100`}
                  className="text-emerald-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {content.habitScore}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Habit Score
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep building!
              </p>
            </div>
          </div>
        );

      case "cbt_milestone":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
              <p className="text-2xl font-bold text-pink-600">
                {content.cbtData?.moodsLogged || 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Moods logged</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <p className="text-2xl font-bold text-purple-600">
                {content.cbtData?.exercisesCompleted || 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Exercises</p>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {content.description}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={postUserPicture} />
            <AvatarFallback>
              {postUserName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {postUserName}
            </p>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[post.type]}`}
          >
            <Icon className="h-3 w-3" />
            {post.type.replace("_", " ")}
          </span>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MoreHorizontal className="h-5 w-5 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="mb-4 text-slate-700 dark:text-slate-300">{post.caption}</p>
      )}

      {/* Content */}
      <div className="mb-4">{renderPostContent()}</div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            post.isLiked
              ? "text-red-500"
              : "text-slate-500 hover:text-red-500"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`}
          />
          <span className="text-sm font-medium">{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-blue-500"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-emerald-500"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            {/* Comment input */}
            <div className="mb-3 flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                className="flex-1"
              />
              <Button
                onClick={handleComment}
                disabled={!commentText.trim() || isSubmittingComment}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              {post.comments.map((comment) => {
                const commentUser = comment.userId || { _id: "", name: "User", profilePicture: "" };
                const commentUserId = typeof commentUser === "string" ? commentUser : commentUser._id;
                const commentUserName = typeof commentUser === "string" ? "User" : (commentUser.name || "User");
                const commentUserPicture = typeof commentUser === "string" ? "" : (commentUser.profilePicture || "");

                return (
                <div key={comment._id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commentUserPicture} />
                    <AvatarFallback>
                      {commentUserName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {commentUserName}
                      </p>
                      {(user?._id === commentUserId || isOwner) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {comment.text}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
