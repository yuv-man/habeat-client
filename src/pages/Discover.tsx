import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Users, UserPlus, UserCheck, ArrowLeft, Loader2, TrendingUp, Sparkles, UserHeart } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { socialAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  profilePicture?: string;
  reason?: string;
  followerCount?: number;
}

interface FollowState {
  [userId: string]: boolean;
}

const Discover = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [followState, setFollowState] = useState<FollowState>({});
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user && !token) {
      navigate("/register");
    }
  }, [user, authLoading, token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Get users the current user is following
        const followingRes = await socialAPI.getFollowing(user._id);
        setFollowing(followingRes.data.users || []);

        // Initialize follow state
        const initialState: FollowState = {};
        (followingRes.data.users || []).forEach((u: UserProfile) => {
          initialState[u._id] = true;
        });
        setFollowState(initialState);

        // Get suggested users from backend (popular, active, follow-backs)
        const suggestedRes = await socialAPI.getSuggestedUsers(15);
        setSuggestedUsers(suggestedRes.data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) return;
    setLoadingFollow(userId);
    try {
      if (followState[userId]) {
        await socialAPI.unfollow(userId);
        setFollowState((prev) => ({ ...prev, [userId]: false }));
        toast.success("Unfollowed");
      } else {
        await socialAPI.follow(userId);
        setFollowState((prev) => ({ ...prev, [userId]: true }));
        toast.success("Following!");
      }
    } catch (error) {
      console.error("Failed to update follow:", error);
      toast.error("Failed to update");
    } finally {
      setLoadingFollow(null);
    }
  };

  const filteredFollowing = following.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (token && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MealLoader />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getReasonIcon = (reason?: string) => {
    switch (reason) {
      case "Popular":
        return <TrendingUp className="w-3 h-3" />;
      case "Active":
        return <Sparkles className="w-3 h-3" />;
      case "Follows you":
        return <UserHeart className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getReasonStyle = (reason?: string) => {
    switch (reason) {
      case "Popular":
        return "bg-purple-50 text-purple-600";
      case "Active":
        return "bg-emerald-50 text-emerald-600";
      case "Follows you":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const UserCard = ({ userProfile, showFollowButton = true }: { userProfile: UserProfile; showFollowButton?: boolean }) => {
    const isFollowing = followState[userProfile._id];
    const isLoading = loadingFollow === userProfile._id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {userProfile.profilePicture ? (
              <img
                src={userProfile.profilePicture}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{userProfile.name}</p>
            {userProfile.reason && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${getReasonStyle(userProfile.reason)}`}>
                {getReasonIcon(userProfile.reason)}
                {userProfile.reason}
              </span>
            )}
          </div>
        </div>
        {showFollowButton && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={() => handleFollow(userProfile._id)}
            disabled={isLoading}
            className={`h-8 text-xs ${
              isFollowing
                ? "border-gray-200 text-gray-600"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <DashboardLayout currentView="daily" hidePlanBanner>
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-gray-900">Discover</h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <MealLoader />
          </div>
        ) : (
          <>
            {/* Search Results - combined from suggested and following */}
            {searchQuery ? (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Search Results
                </h2>
                {(() => {
                  const allUsers = [...suggestedUsers, ...following];
                  const uniqueUsers = allUsers.filter((u, i, arr) =>
                    arr.findIndex(x => x._id === u._id) === i
                  );
                  const filtered = uniqueUsers.filter((u) =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  return filtered.length > 0 ? (
                    <div className="space-y-2">
                      {filtered.map((userProfile) => (
                        <UserCard key={userProfile._id} userProfile={userProfile} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No users found</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                {/* Suggested Users */}
                {suggestedUsers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">
                      Suggested for you
                    </h2>
                    <div className="space-y-2">
                      {suggestedUsers.map((userProfile) => (
                        <UserCard key={userProfile._id} userProfile={userProfile} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Following */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    People you follow
                  </h2>
                  {filteredFollowing.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFollowing.map((userProfile) => (
                        <UserCard key={userProfile._id} userProfile={userProfile} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        You're not following anyone yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Follow suggested users above to see their posts
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Discover;
