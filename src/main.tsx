import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform } from "./lib/platform";

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
  import("@capgo/capacitor-social-login")
    .then(({ SocialLogin }) => {
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

      // Configure iOS if client ID is available
      if (iosClientId && webClientId) {
        console.log("[main] Configuring iOS client");
        initConfig.google = {
          iOSClientId: iosClientId,
          iOSServerClientId: webClientId, // Same as webClientId for backend verification
          mode: "online", // 'online' for user data, 'offline' for server auth code only
        };
      }

      // Configure Android - only needs webClientId
      if (webClientId) {
        console.log("[main] Configuring Android client");
        if (!initConfig.google) {
          initConfig.google = {};
        }
        initConfig.google.webClientId = webClientId;
      }

      console.log("[main] Init config:", JSON.stringify(initConfig, null, 2));

      // Initialize if we have at least one platform configured
      // For Android, webClientId is sufficient; for iOS, need both iosClientId and webClientId
      if (initConfig.google && webClientId) {
        console.log("[main] Initializing Social Login plugin");
        SocialLogin.initialize(initConfig)
          .then(() => {
            console.log("[main] Social Login plugin initialized successfully");
          })
          .catch((error) => {
            console.error("[main] Failed to initialize Social Login plugin:", {
              error,
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
          });
      } else {
        console.warn("[main] Skipping initialization - no valid config", {
          hasGoogleConfig: !!initConfig.google,
          hasIosClientId: !!iosClientId,
          hasAndroidClientId: !!androidClientId,
          hasWebClientId: !!webClientId,
        });
      }
    })
    .catch((error) => {
      console.error("[main] Failed to load Social Login plugin:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
} else {
  console.log("[main] Web platform detected, skipping Social Login initialization");
}

createRoot(document.getElementById("root")!).render(<App />);
