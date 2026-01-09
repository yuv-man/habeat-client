import { isNativePlatform } from "./platform";
import { initGoogleOAuth, triggerGoogleSignIn } from "./googleOAuth";

/**
 * Unified Google Authentication
 * Uses native Capacitor Google Auth on mobile, web OAuth on web
 *
 * @param action - "signin" or "signup"
 * @returns Promise resolving to the idToken (JWT) from Google
 */
export const signInWithGoogle = async (
  _action: "signin" | "signup" = "signin"
): Promise<string> => {
  if (isNativePlatform()) {
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
    // Web authentication using Google Identity Services
    return new Promise((resolve, reject) => {
      initGoogleOAuth((credential) => {
        // credential is the idToken (JWT) from Google
        resolve(credential);
      })
        .then(() => {
          triggerGoogleSignIn();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

/**
 * Sign out from Google (only applicable for native platforms)
 */
export const signOutFromGoogle = async (): Promise<void> => {
  if (isNativePlatform()) {
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
