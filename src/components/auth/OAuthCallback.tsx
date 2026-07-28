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
import MealLoader from "@/components/helper/MealLoader";

const KYC_STORAGE_KEY = "habeat_current_step";

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();
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

        // Handle the OAuth callback with action.
        // If signup fails because the account already exists, retry as signin.
        let isNewUser = false;
        try {
          ({ isNewUser } = await handleOAuthCallback(
            provider,
            action,
            userId || undefined,
            accessToken || undefined
          ));
        } catch (callbackError) {
          const msg =
            callbackError instanceof Error
              ? callbackError.message.toLowerCase()
              : "";
          const isAlreadyExists =
            msg.includes("already") ||
            msg.includes("exists") ||
            msg.includes("registered") ||
            msg.includes("taken");
          if (action === "signup" && isAlreadyExists) {
            ({ isNewUser } = await handleOAuthCallback(
              provider,
              "signin",
              userId || undefined,
              accessToken || undefined
            ));
          } else {
            throw callbackError;
          }
        }

        // Clean up any pending KYC state left before the OAuth redirect
        localStorage.removeItem(KYC_STORAGE_KEY);

        toast({
          title: "Authentication Successful",
          description: "You have been successfully authenticated.",
        });

        const currentUser = useAuthStore.getState().user;
        const currentPlan = useAuthStore.getState().plan;

        // Any user who hasn't finished registration (new signup OR existing account
        // that never completed KYC) must go through the registration flow.
        if (isNewUser || !currentUser?.kycCompleted) {
          localStorage.setItem(KYC_STORAGE_KEY, "diet");
          localStorage.setItem(
            "habeat_auth_data",
            JSON.stringify({
              name: currentUser?.name || "",
              email: currentUser?.email || "",
              password: "",
              authMethod: "google",
            })
          );
          navigate("/register");
          return;
        }

        // Fully registered user — route to tracker or regeneration
        if (currentPlan) {
          navigate("/daily-tracker");
        } else {
          navigate("/weekly-overview");
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

        // Clear KYC state on error
        localStorage.removeItem(KYC_STORAGE_KEY);

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
            <MealLoader />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
