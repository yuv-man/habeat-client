import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get parameters from URL
        const provider = searchParams.get("provider");
        const action = (searchParams.get("action") || "signin") as
          | "signin"
          | "signup";
        const idToken = searchParams.get("id_token");
        const accessToken = searchParams.get("access_token");
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
          idToken || undefined,
          accessToken || undefined
        );

        toast({
          title: "Authentication Successful",
          description: "You have been successfully authenticated.",
        });

        // Redirect to daily tracker
        navigate("/daily-tracker");
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
  }, [searchParams, handleOAuthCallback, navigate, toast]);

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
