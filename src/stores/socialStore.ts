import { create } from "zustand";
import {
  socialAPI,
  ISocialPost,
  CreatePostDto,
  SocialFeedResponse,
  FollowListResponse,
} from "@/services/api";

interface SocialState {
  // Feed
  posts: ISocialPost[];
  feedPagination: SocialFeedResponse["pagination"] | null;
  feedLoading: boolean;
  feedError: string | null;

  // User posts
  userPosts: ISocialPost[];
  userPostsPagination: SocialFeedResponse["pagination"] | null;
  userPostsLoading: boolean;

  // Follow data
  followers: FollowListResponse["users"];
  following: FollowListResponse["users"];
  followCounts: { followersCount: number; followingCount: number } | null;

  // Actions
  fetchFeed: (page?: number, append?: boolean) => Promise<void>;
  fetchUserPosts: (userId: string, page?: number, append?: boolean) => Promise<void>;
  createPost: (post: CreatePostDto) => Promise<ISocialPost>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  fetchFollowers: (page?: number) => Promise<void>;
  fetchFollowing: (page?: number) => Promise<void>;
  fetchFollowStatus: (userId: string) => Promise<{ isFollowing: boolean; followersCount: number; followingCount: number }>;
  trackShare: (postId: string) => Promise<void>;
  clearFeed: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // Initial state
  posts: [],
  feedPagination: null,
  feedLoading: false,
  feedError: null,

  userPosts: [],
  userPostsPagination: null,
  userPostsLoading: false,

  followers: [],
  following: [],
  followCounts: null,

  // Actions
  fetchFeed: async (page = 1, append = false) => {
    set({ feedLoading: true, feedError: null });
    try {
      const response = await socialAPI.getFeed(page, 20);
      set((state) => ({
        posts: append ? [...state.posts, ...response.data.posts] : response.data.posts,
        feedPagination: response.data.pagination,
        feedLoading: false,
      }));
    } catch (error) {
      set({ feedError: (error as Error).message, feedLoading: false });
    }
  },

  fetchUserPosts: async (userId, page = 1, append = false) => {
    set({ userPostsLoading: true });
    try {
      const response = await socialAPI.getUserPosts(userId, page, 20);
      set((state) => ({
        userPosts: append ? [...state.userPosts, ...response.data.posts] : response.data.posts,
        userPostsPagination: response.data.pagination,
        userPostsLoading: false,
      }));
    } catch (error) {
      set({ userPostsLoading: false });
      throw error;
    }
  },

  createPost: async (post) => {
    const response = await socialAPI.createPost(post);
    const newPost = response.data;

    // Add to feed at the beginning
    set((state) => ({
      posts: [newPost, ...state.posts],
    }));

    return newPost;
  },

  deletePost: async (postId) => {
    await socialAPI.deletePost(postId);

    // Remove from both feeds
    set((state) => ({
      posts: state.posts.filter((p) => p._id !== postId),
      userPosts: state.userPosts.filter((p) => p._id !== postId),
    }));
  },

  toggleLike: async (postId) => {
    const response = await socialAPI.toggleLike(postId);
    const { isLiked, likesCount } = response.data;

    // Update in both feeds
    const updatePost = (post: ISocialPost) =>
      post._id === postId ? { ...post, isLiked, likesCount } : post;

    set((state) => ({
      posts: state.posts.map(updatePost),
      userPosts: state.userPosts.map(updatePost),
    }));
  },

  addComment: async (postId, text) => {
    const response = await socialAPI.addComment(postId, text);
    const newComment = response.data;

    // Update in both feeds
    const updatePost = (post: ISocialPost) =>
      post._id === postId
        ? {
            ...post,
            comments: [...post.comments, newComment],
            commentsCount: post.commentsCount + 1,
          }
        : post;

    set((state) => ({
      posts: state.posts.map(updatePost),
      userPosts: state.userPosts.map(updatePost),
    }));
  },

  deleteComment: async (postId, commentId) => {
    await socialAPI.deleteComment(postId, commentId);

    // Update in both feeds
    const updatePost = (post: ISocialPost) =>
      post._id === postId
        ? {
            ...post,
            comments: post.comments.filter((c) => c._id !== commentId),
            commentsCount: Math.max(0, post.commentsCount - 1),
          }
        : post;

    set((state) => ({
      posts: state.posts.map(updatePost),
      userPosts: state.userPosts.map(updatePost),
    }));
  },

  followUser: async (userId) => {
    await socialAPI.follow(userId);
  },

  unfollowUser: async (userId) => {
    await socialAPI.unfollow(userId);
  },

  fetchFollowers: async (page = 1) => {
    const response = await socialAPI.getFollowers(page, 50);
    set({ followers: response.data.users });
  },

  fetchFollowing: async (page = 1) => {
    const response = await socialAPI.getFollowing(page, 50);
    set({ following: response.data.users });
  },

  fetchFollowStatus: async (userId) => {
    const response = await socialAPI.getFollowStatus(userId);
    set({ followCounts: { followersCount: response.data.followersCount, followingCount: response.data.followingCount } });
    return response.data;
  },

  trackShare: async (postId) => {
    await socialAPI.trackShare(postId);

    // Update share count in posts
    const updatePost = (post: ISocialPost) =>
      post._id === postId ? { ...post, shares: post.shares + 1 } : post;

    set((state) => ({
      posts: state.posts.map(updatePost),
      userPosts: state.userPosts.map(updatePost),
    }));
  },

  clearFeed: () => {
    set({
      posts: [],
      feedPagination: null,
      userPosts: [],
      userPostsPagination: null,
    });
  },
}));
