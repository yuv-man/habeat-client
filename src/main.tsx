import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform } from "./lib/platform";

// Initialize Social Login plugin for native platforms
if (isNativePlatform()) {
  import("@capgo/capacitor-social-login")
    .then(({ SocialLogin }) => {
      // Get client IDs from environment
      const iosClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS || "";
      const androidClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID_ANDROID || "";
      const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

      const initConfig: any = {};

      // Configure iOS if client ID is available
      if (iosClientId && webClientId) {
        initConfig.google = {
          iOSClientId: iosClientId,
          iOSServerClientId: webClientId, // Same as webClientId for backend verification
          mode: "online", // 'online' for user data, 'offline' for server auth code only
        };
      }

      // Configure Android - only needs webClientId
      if (webClientId) {
        if (!initConfig.google) {
          initConfig.google = {};
        }
        initConfig.google.webClientId = webClientId;
      }

      // Initialize if we have at least one platform configured
      if (initConfig.google && (iosClientId || androidClientId)) {
        SocialLogin.initialize(initConfig).catch((error) => {
          console.warn("Failed to initialize Social Login plugin:", error);
        });
      }
    })
    .catch((error) => {
      console.warn("Failed to load Social Login plugin:", error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
