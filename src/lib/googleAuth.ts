import { shouldUseMobileAuth } from "./platform";

/**
 * Unified Google Authentication
 * Uses native Capacitor Google Auth on mobile, web OAuth on web
 * Can be forced via VITE_GOOGLE_AUTH_MODE env variable
 *
 * @param action - "signin" or "signup"
 * @returns Promise resolving to the idToken (JWT) from Google
 */
export const signInWithGoogle = async (
  _action: "signin" | "signup" = "signin"
): Promise<string> => {
  const useMobile = shouldUseMobileAuth();

  if (useMobile) {
    // Native mobile authentication using Capacitor Social Login
    try {
      // Dynamic import to avoid TypeScript errors on web
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      // Sign in with Google using the new SocialLogin API
      const result = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
        },
      });

      const idToken = result.result.idToken;

      if (!idToken) {
        throw new Error("Failed to get ID token from Google");
      }

      return idToken;
    } catch (error) {
      // Handle user cancellation
      if (error instanceof Error && error.message.includes("cancel")) {
        throw new Error("Google sign-in was cancelled");
      }
      throw error;
    }
  } else {
    // Web authentication using Google Identity Services with popup
    try {
      console.log("[signInWithGoogle] Starting web Google OAuth");

      // Load Google script first
      const { loadGoogleScript, triggerGoogleSignIn } = await import(
        "./googleOAuth"
      );
      await loadGoogleScript();

      // Trigger popup-based sign-in
      const idToken = await triggerGoogleSignIn();

      if (!idToken) {
        throw new Error("Failed to get ID token from Google");
      }

      console.log("[signInWithGoogle] Successfully got idToken");
      return idToken;
    } catch (error) {
      console.error("[signInWithGoogle] Error:", error);
      // Handle user cancellation
      if (
        error instanceof Error &&
        (error.message.includes("cancel") || error.message.includes("blocked"))
      ) {
        throw new Error("Google sign-in was cancelled");
      }
      throw error;
    }
  }
};

/**
 * Sign out from Google (only applicable for native platforms)
 */
export const signOutFromGoogle = async (): Promise<void> => {
  const useMobile = shouldUseMobileAuth();

  if (useMobile) {
    try {
      // Dynamic import to avoid TypeScript errors on web
      const { SocialLogin } = await import("@capgo/capacitor-social-login");
      await SocialLogin.logout({ provider: "google" });
    } catch (error) {
      console.error("Failed to sign out from Google:", error);
      // Don't throw - sign out failure shouldn't block the app
    }
  }
};
