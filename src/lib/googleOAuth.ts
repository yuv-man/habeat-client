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

  try {
    await loadGoogleScript();
  } catch (error) {
    throw new Error(
      "Failed to load Google Identity Services script. Please check your internet connection."
    );
  }

  if (!window.google?.accounts?.id) {
    throw new Error(
      "Google Identity Services failed to load. Please refresh the page and try again."
    );
  }

  // Set up Google OAuth with a callback
  // When user signs in, Google calls this callback with response.credential
  // The credential IS the idToken (JWT token) that you need
  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        // Check if response has credential
        if (!response || !response.credential) {
          console.error(
            "Google sign-in response missing credential:",
            response
          );
          return;
        }
        // response.credential is the idToken (JWT) from Google
        callback(response.credential);
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to initialize Google sign-in: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Trigger Google Sign-In using a programmatic button click
// This is more reliable than prompt() which may not show if One Tap was dismissed
export const triggerGoogleSignIn = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services not initialized"));
      return;
    }

    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error("Google Client ID is not configured"));
      return;
    }

    // Create a temporary container for the button
    const containerId = `google-signin-temp-${Date.now()}`;
    const container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    let resolved = false;
    let timeoutId: NodeJS.Timeout | null = null;

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        reject(new Error("Google sign-in timed out. Please try again."));
      }
    }, 60000);

    // Initialize callback
    const callback = (credential: string) => {
      if (!resolved) {
        resolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        resolve(credential);
      }
    };

    // Initialize Google OAuth
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          callback(response.credential);
        }
      },
    });

    // Render button and click it programmatically
    try {
      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
      });

      // Wait a bit for button to render, then click it
      setTimeout(() => {
        const button = container.querySelector(
          "div[role='button']"
        ) as HTMLElement;
        if (button) {
          button.click();
        } else {
          // Fallback: try prompt() if button click doesn't work
          try {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            }
          } catch (promptError) {
            if (!resolved) {
              resolved = true;
              if (timeoutId) clearTimeout(timeoutId);
              if (document.body.contains(container)) {
                document.body.removeChild(container);
              }
              reject(
                new Error("Failed to trigger Google sign-in. Please try again.")
              );
            }
          }
        }
      }, 100);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        document.body.removeChild(container);
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to initialize Google sign-in")
        );
      }
    }
  });
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
