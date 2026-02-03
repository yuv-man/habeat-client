import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { user, token, fetchUser } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Refresh user data to get updated subscription tier
    const refreshUserData = async () => {
      if (token) {
        try {
          await fetchUser(token);
        } catch (error) {
          console.error("Error refreshing user data:", error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };

    // Wait a moment for webhook to process
    const timer = setTimeout(() => {
      refreshUserData();
    }, 2000);

    return () => clearTimeout(timer);
  }, [token, fetchUser]);

  return (
    <DashboardLayout>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          {isRefreshing ? (
            <>
              <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
              <h1 className="mb-2 text-2xl font-bold">
                Processing your subscription...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we update your account.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h1 className="mb-2 text-2xl font-bold">
                Welcome to{" "}
                {user?.subscriptionTier
                  ? user.subscriptionTier.charAt(0).toUpperCase() +
                    user.subscriptionTier.slice(1)
                  : "Premium"}
                !
              </h1>
              <p className="mb-6 text-muted-foreground">
                Your subscription is now active. You have access to all premium
                features.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/daily-tracker")} size="lg">
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/subscription")}
                  variant="outline"
                  size="lg"
                >
                  View Subscription Details
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionSuccess;
