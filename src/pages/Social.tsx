import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocialFeed } from "@/components/social";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import CreatePostModal from "@/components/social/CreatePostModal";

const Social = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = useCallback(() => {
    // Trigger feed refresh by changing key
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MealLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Users className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Please log in to view the community.</p>
        <Button onClick={() => navigate("/register")} className="bg-emerald-500 hover:bg-emerald-600">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout currentView="daily" hidePlanBanner>
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-gray-900">Community</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="mr-1 h-4 w-4" />
              Post
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/social/discover")}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">Welcome to the Community!</h2>
              <p className="text-sm text-white/90">
                Share achievements, celebrate milestones, and connect with others on their wellness journey.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feed */}
        <SocialFeed key={refreshKey} />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </DashboardLayout>
  );
};

export default Social;
