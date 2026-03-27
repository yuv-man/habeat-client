import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { useSocialStore } from "@/stores/socialStore";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";

interface SocialFeedProps {
  userId?: string; // If provided, show user's posts. Otherwise, show general feed.
}

const SocialFeed = ({ userId }: SocialFeedProps) => {
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

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId, 1, false);
    } else {
      fetchFeed(1, false);
    }
  }, [userId, fetchFeed, fetchUserPosts]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!pagination || pagination.page >= pagination.totalPages || isLoading) return;

    const nextPage = pagination.page + 1;
    if (userId) {
      fetchUserPosts(userId, nextPage, true);
    } else {
      fetchFeed(nextPage, true);
    }
  }, [pagination, isLoading, userId, fetchFeed, fetchUserPosts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore]);

  const handleRefresh = () => {
    if (userId) {
      fetchUserPosts(userId, 1, false);
    } else {
      fetchFeed(1, false);
    }
  };

  // Empty state
  if (!isLoading && displayPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          No posts yet
        </h3>
        <p className="mb-4 text-slate-500">
          {userId
            ? "This user hasn't shared any achievements yet."
            : "Be the first to share an achievement!"}
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </motion.div>
    );
  }

  // Error state
  if (feedError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900"
      >
        <p className="mb-4 text-red-500">{feedError}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Posts */}
      {displayPosts.map((post, index) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        )}

        {pagination && pagination.page >= pagination.totalPages && displayPosts.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
