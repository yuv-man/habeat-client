import { useEffect, useCallback, useRef } from "react";
import { Loader2, Users } from "lucide-react";
import { useSocialStore } from "@/stores/socialStore";
import PostCard from "./PostCard";
import { cn } from "@/lib/utils";

interface SocialFeedProps {
  userId?: string;
  refreshKey?: number;
}

const SocialFeed = ({ userId, refreshKey }: SocialFeedProps) => {
  const {
    posts,
    userPosts,
    feedPagination,
    userPostsPagination,
    feedLoading,
    userPostsLoading,
    feedError,
    fetchFeed,
    fetchUserPosts,
  } = useSocialStore();

  const displayPosts = userId ? userPosts : posts;
  const pagination = userId ? userPostsPagination : feedPagination;
  const isLoading = userId ? userPostsLoading : feedLoading;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId, 1, false);
    } else {
      fetchFeed(1, false);
    }
  }, [userId, fetchFeed, fetchUserPosts, refreshKey]);

  const handleLoadMore = useCallback(() => {
    if (!pagination || pagination.page >= pagination.totalPages || isLoading) return;
    const nextPage = pagination.page + 1;
    if (userId) fetchUserPosts(userId, nextPage, true);
    else fetchFeed(nextPage, true);
  }, [pagination, isLoading, userId, fetchFeed, fetchUserPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMore(); },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  if (!isLoading && displayPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-semibold text-gray-500 mb-1">No posts yet</p>
        <p className="text-sm text-gray-400">
          {userId ? "Nothing shared yet." : "Be the first to share something!"}
        </p>
      </div>
    );
  }

  if (feedError) {
    return (
      <div className="text-center py-12 text-red-400 text-sm">{feedError}</div>
    );
  }

  return (
    <div>
      {/* Bento grid: 2-col on md+, mindful_moment spans full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {displayPosts.map((post) => (
          <div
            key={post._id}
            className={cn(post.type === "mindful_moment" && "md:col-span-2")}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="py-6 flex justify-center">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-green-800/40" />}
        {!isLoading && pagination && pagination.page >= pagination.totalPages && displayPosts.length > 0 && (
          <p className="text-xs text-gray-300">You're all caught up</p>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
