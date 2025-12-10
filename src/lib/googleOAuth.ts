// Google OAuth utility using Google Identity Services

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: string;
              size?: string;
              width?: string;
              text?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Load Google Identity Services script
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
};

// Initialize Google OAuth for sign-in/sign-up
// The callback receives the credential parameter, which IS the idToken (JWT) from Google
// This idToken is what you send to your backend for authentication
export const initGoogleOAuth = async (
  callback: (credential: string) => void // credential = idToken (JWT from Google)
): Promise<void> => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file"
    );
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services failed to load");
  }

  // Set up Google OAuth with a callback
  // When user signs in, Google calls this callback with response.credential
  // The credential IS the idToken (JWT token) that you need
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      // response.credential is the idToken (JWT) from Google
      callback(response.credential);
    },
  });
};

// Trigger Google Sign-In
export const triggerGoogleSignIn = (): void => {
  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services not initialized");
  }
  window.google.accounts.id.prompt();
};

// One Tap Sign-In (automatic prompt)
export const promptOneTap = (callback: (credential: string) => void): void => {
  initGoogleOAuth(callback).then(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  });
};

// Button-based sign-in
export const renderGoogleButton = (
  elementId: string,
  callback: (credential: string) => void,
  onError?: (error: Error) => void
): void => {
  initGoogleOAuth(callback)
    .then(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          document.getElementById(elementId),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
          }
        );
      }
    })
    .catch((error) => {
      onError?.(error);
    });
};

// Decode JWT token to get user info (client-side only, don't trust this for auth)
export const decodeGoogleToken = (
  credential: string
): {
  email: string;
  name: string;
  picture: string;
  sub: string;
} => {
  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error("Failed to decode Google token");
  }
};
