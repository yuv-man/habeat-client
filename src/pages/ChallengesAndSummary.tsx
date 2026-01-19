import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Target, Award } from "lucide-react";
import MealLoader from "@/components/helper/MealLoader";
import { EngagementCard } from "@/components/engagement";
import { ChallengeList } from "@/components/challenges";
import { DailySummaryCard } from "@/components/reflection";

const ChallengesAndSummary = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MealLoader customMessages={["Loading your challenges and summary..."]} />
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <DashboardLayout currentView="weekly">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Challenges & Summary</h1>
              <p className="text-sm text-gray-500">
                Track your challenges and daily progress
              </p>
            </div>
          </div>
        </div>

        {/* Engagement Card */}
        <EngagementCard className="mb-6" />

        {/* Challenges */}
        <ChallengeList className="mb-6" />

        {/* Daily Summary Card */}
        <DailySummaryCard className="mb-6" showDismiss={false} />
      </div>
    </DashboardLayout>
  );
};

export default ChallengesAndSummary;
