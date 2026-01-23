import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform } from "./lib/platform";
import { Capacitor } from "@capacitor/core";

// Suppress harmless browser extension errors
window.addEventListener("error", (event) => {
  // Suppress the common browser extension message channel error
  if (
    event.message?.includes(
      "A listener indicated an asynchronous response by returning true"
    ) ||
    event.message?.includes("message channel closed")
  ) {
    event.preventDefault();
    console.warn("Suppressed browser extension error:", event.message);
    return false;
  }
});

// Also catch unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason?.message?.includes(
      "A listener indicated an asynchronous response by returning true"
    ) ||
    event.reason?.message?.includes("message channel closed")
  ) {
    event.preventDefault();
    console.warn("Suppressed browser extension promise rejection:", event.reason);
    return false;
  }
});

// Initialize Social Login plugin for native platforms
if (isNativePlatform()) {
  console.log("[main] Native platform detected, initializing Social Login");
  
  // Wait for Capacitor to be ready before initializing
  const initializeSocialLogin = async () => {
    try {
      // Ensure Capacitor is available
      if (!Capacitor.isNativePlatform()) {
        console.warn("[main] Capacitor not ready, skipping initialization");
        return;
      }
      
      const { SocialLogin } = await import("@capgo/capacitor-social-login");
      console.log("[main] Social Login plugin loaded successfully");
      
      // Get client IDs from environment
      const iosClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS || "";
      const androidClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID_ANDROID || "";
      const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

      console.log("[main] Client IDs:", {
        hasIosClientId: !!iosClientId,
        hasAndroidClientId: !!androidClientId,
        hasWebClientId: !!webClientId,
        webClientIdLength: webClientId.length,
      });

      const initConfig: any = {};

      // Configure iOS - need both iOSClientId and webClientId
      if (iosClientId && webClientId) {
        console.log("[main] Configuring iOS client");
        initConfig.google = {
          webClientId: webClientId, // Required for iOS as well
          iOSClientId: iosClientId,
          iOSServerClientId: webClientId, // Server client ID for backend verification
          mode: "online", // 'online' for user data, 'offline' for server auth code only
        };
      }

      // Configure Android - only needs webClientId
      if (webClientId && !iosClientId) {
        console.log("[main] Configuring Android client");
        initConfig.google = {
          webClientId: webClientId,
        };
      }

      console.log("[main] Init config:", JSON.stringify(initConfig, null, 2));

      // Initialize if we have at least one platform configured
      if (initConfig.google && webClientId) {
        console.log("[main] Initializing Social Login plugin");
        await SocialLogin.initialize(initConfig);
        console.log("[main] Social Login plugin initialized successfully");
      } else {
        console.warn("[main] Skipping initialization - no valid config", {
          hasGoogleConfig: !!initConfig.google,
          hasIosClientId: !!iosClientId,
          hasAndroidClientId: !!androidClientId,
          hasWebClientId: !!webClientId,
        });
      }
    } catch (error) {
      console.error("[main] Failed to initialize Social Login plugin:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  // Initialize after DOM is ready and Capacitor bridge is established
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeSocialLogin, 500);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeSocialLogin, 500);
    });
  }
} else {
  console.log("[main] Web platform detected, skipping Social Login initialization");
}

createRoot(document.getElementById("root")!).render(<App />);
