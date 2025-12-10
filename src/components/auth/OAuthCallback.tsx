import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleOAuthCallback, user, plan } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Parse URL search parameters directly from location.search
        const searchParams = new URLSearchParams(location.search);

        // Get parameters from URL
        const provider = searchParams.get("provider");
        const action = (searchParams.get("action") || "signin") as
          | "signin"
          | "signup";
        const userId = searchParams.get("userId");
        const accessToken = searchParams.get("token");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || "OAuth authentication failed");
        }

        if (!provider) {
          throw new Error("No OAuth provider specified");
        }

        // Handle the OAuth callback with action
        await handleOAuthCallback(
          provider,
          action,
          userId || undefined,
          accessToken || undefined
        );

        toast({
          title: "Authentication Successful",
          description: "You have been successfully authenticated.",
        });

        // Get current user state after authentication
        const currentUser = useAuthStore.getState().user;
        const currentPlan = useAuthStore.getState().plan;

        // Redirect based on user state
        // If user has completed KYC (has plan), go to daily tracker
        // If user exists but no plan, go to weekly overview to regenerate plan
        // If no user, redirect to register
        if (currentUser && currentPlan) {
          navigate("/daily-tracker");
        } else if (currentUser && !currentPlan) {
          // User exists but no plan - redirect to weekly overview to regenerate
          navigate("/weekly-overview");
        } else {
          // No user - redirect to register
          navigate("/register");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Authentication Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to complete authentication",
          variant: "destructive",
        });

        // Redirect to login page
        navigate("/");
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Only depend on location.search string, not the object

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Completing Authentication</CardTitle>
            <CardDescription>
              Please wait while we complete your sign-in...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
