/**
 * Hook for handling back navigation on mobile devices
 * Supports:
 * - Android hardware back button
 * - Android gesture navigation (swipe from left/right edge on Pixel and other devices)
 * - iOS swipe gestures (swipe from left edge)
 *
 * Note: Android gesture navigation triggers the same backButton event as the hardware button,
 * so both are handled automatically by this hook.
 */

import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { isNativePlatform } from "@/lib/platform";

interface UseBackNavigationOptions {
  /**
   * Whether to enable back navigation (default: true)
   */
  enabled?: boolean;
  /**
   * Callback when back navigation is triggered
   * Return false to prevent default navigation
   */
  onBack?: () => boolean | void;
  /**
   * Routes that should exit the app instead of going back
   */
  exitRoutes?: string[];
  /**
   * Routes that should not allow back navigation
   */
  disabledRoutes?: string[];
}

/**
 * Hook to handle back navigation on mobile devices
 *
 * @param options Configuration options
 * @returns Object with methods to control back navigation
 */
export function useBackNavigation(options: UseBackNavigationOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    enabled = true,
    onBack,
    exitRoutes = ["/", "/register"],
    disabledRoutes = ["/auth/callback"],
  } = options;

  const navigationHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    // Track navigation history (avoid duplicates)
    const currentPath = location.pathname;
    const lastPath =
      navigationHistoryRef.current[navigationHistoryRef.current.length - 1];

    // Only add if it's different from the last entry
    if (currentPath !== lastPath) {
      navigationHistoryRef.current.push(currentPath);

      // Keep history limited to last 50 entries
      if (navigationHistoryRef.current.length > 50) {
        navigationHistoryRef.current = navigationHistoryRef.current.slice(-50);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Only enable on native platforms
    if (!isNativePlatform() || !enabled) {
      return;
    }

    // Check if current route should disable back navigation
    if (disabledRoutes.includes(location.pathname)) {
      return;
    }

    let backButtonListener: any = null;

    const handleBackButton = () => {
      // Call custom handler if provided
      if (onBack) {
        const shouldPreventDefault = onBack();
        if (shouldPreventDefault === false) {
          return;
        }
      }

      // Check if we should exit the app
      if (exitRoutes.includes(location.pathname)) {
        // Exit the app
        App.exitApp();
        return;
      }

      // Check if there's history to go back to
      if (navigationHistoryRef.current.length > 1) {
        // Remove current route from history
        navigationHistoryRef.current.pop();
        const previousPath =
          navigationHistoryRef.current[navigationHistoryRef.current.length - 1];

        // Navigate to previous route
        if (previousPath) {
          navigate(previousPath);
        } else {
          navigate(-1);
        }
      } else {
        // No history, exit app or go to home
        if (location.pathname !== "/" && location.pathname !== "/register") {
          navigate("/");
        } else {
          App.exitApp();
        }
      }
    };

    // Register back button listener
    const setupListener = async () => {
      if (Capacitor.isPluginAvailable("App")) {
        try {
          backButtonListener = await App.addListener(
            "backButton",
            handleBackButton
          );
        } catch (error) {
          console.error("Failed to register back button listener:", error);
        }
      }
    };

    setupListener();

    // Cleanup
    return () => {
      if (backButtonListener) {
        backButtonListener.remove().catch((error: any) => {
          console.error("Failed to remove back button listener:", error);
        });
      }
    };
  }, [
    enabled,
    location.pathname,
    navigate,
    onBack,
    exitRoutes,
    disabledRoutes,
  ]);

  return {
    /**
     * Manually trigger back navigation
     */
    goBack: () => {
      if (navigationHistoryRef.current.length > 1) {
        navigationHistoryRef.current.pop();
        navigate(-1);
      } else {
        navigate("/");
      }
    },
    /**
     * Check if back navigation is possible
     */
    canGoBack: () => navigationHistoryRef.current.length > 1,
    /**
     * Get navigation history
     */
    getHistory: () => [...navigationHistoryRef.current],
  };
}
