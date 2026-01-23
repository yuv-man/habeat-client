import { shouldUseMobileAuth } from "./platform";

/**
 * Initialize SocialLogin for native platforms
 * Call this as soon as the app loads!
 */
export const initializeSocialLogin = async (): Promise<void> => {
  const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  
  if (webClientId) {
    // Dynamic import to avoid accessing plugin before Capacitor bridge is ready
    const { SocialLogin } = await import('@capgo/capacitor-social-login');
    await SocialLogin.initialize({
      google: {
        // CRITICAL: Use your WEB Client ID here, even for Android!
        webClientId: webClientId,
        mode: 'online' 
      }
    } as any);
  }
};

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
  // Import Capacitor to check platform directly
  const { Capacitor } = await import("@capacitor/core");
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();
  
  console.log("[signInWithGoogle] Platform detection:", {
    platform,
    isNative,
    shouldUseMobile: shouldUseMobileAuth(),
  });

  // On native platforms, ALWAYS use native flow - never fall back to web
  if (isNative || platform === "ios" || platform === "android") {
    // Native mobile authentication using Capacitor Social Login
    try {
      console.log("[signInWithGoogle] Mobile flow - Starting Google Sign-In");
      
      // Dynamic import to avoid TypeScript errors on web
      const { SocialLogin } = await import("@capgo/capacitor-social-login");
      console.log("[signInWithGoogle] Mobile flow - SocialLogin imported successfully");

      // Sign in with Google using the new SocialLogin API
      console.log("[signInWithGoogle] Mobile flow - Calling SocialLogin.login()");
      const result = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
        },
      });

      console.log("[signInWithGoogle] Mobile flow - Login result received:", {
        provider: result.provider,
        hasResult: !!result.result,
        hasIdToken: !!result.result?.idToken,
        hasAccessToken: !!result.result?.accessToken,
        email: result.result?.email,
      });

      const idToken = result.result.idToken;

      if (!idToken) {
        console.error("[signInWithGoogle] Mobile flow - No idToken in result:", result);
        throw new Error("Failed to get ID token from Google");
      }

      console.log("[signInWithGoogle] Mobile flow - Successfully got idToken, length:", idToken.length);
      return idToken;
    } catch (error) {
      console.error("[signInWithGoogle] Mobile flow - Error caught:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      // Handle user cancellation
      if (error instanceof Error && error.message.includes("cancel")) {
        console.log("[signInWithGoogle] Mobile flow - User cancelled sign-in");
        throw new Error("Google sign-in was cancelled");
      }
      throw error;
    }
  } else {
    // Web authentication using Google Identity Services with popup
    // Only use this on actual web platforms, never on native
    if (!isNative && platform === "web") {
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
    } else {
      // Should never reach here on native platforms
      throw new Error(`Google Sign-In is not available on platform: ${platform}. Please ensure the native Google Sign-In plugin is properly configured.`);
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
