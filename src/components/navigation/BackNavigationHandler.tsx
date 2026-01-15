/**
 * Component to handle back navigation for the entire app
 * Should be placed at the root level to handle global back navigation
 *
 * This handles:
 * - Android hardware back button
 * - Android gesture navigation (swipe from edges on Pixel and other devices)
 * - iOS swipe gestures (swipe from left edge)
 * - Navigation history management
 *
 * Note: Android gesture navigation (introduced in Android 10) works automatically
 * as it triggers the same backButton event as the hardware button.
 */

import { useBackNavigation } from "@/hooks/useBackNavigation";

const BackNavigationHandler = () => {
  // Configure back navigation behavior for the entire app
  useBackNavigation({
    enabled: true,
    // Routes that should exit the app instead of going back
    exitRoutes: ["/", "/register"],
    // Routes where back navigation should be disabled
    disabledRoutes: ["/auth/callback"],
    onBack: () => {
      // You can add custom logic here if needed
      // Return false to prevent default navigation
      // For example, you could check if a modal is open and close it first
      return true;
    },
  });

  return null; // This component doesn't render anything
};

export default BackNavigationHandler;
