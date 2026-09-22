import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MealLoader from "@/components/helper/MealLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { clearExpiredCacheSync } from "@/lib/cache";
import BackNavigationHandler from "@/components/navigation/BackNavigationHandler";
import WatchPermissionModal from "@/components/watch/WatchPermissionModal";
import { App as CapacitorApp } from "@capacitor/app";
import { useWatchStore } from "@/stores/watchStore";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import OAuthCallback from "./components/auth/OAuthCallback";

// Lazily loaded pages (code splitting for better performance)
const Registration = lazy(() => import("./pages/Registration"));
const DailyTracker = lazy(() => import("./pages/DailyTracker"));
const WeeklyOverview = lazy(() => import("./pages/WeeklyOverview"));
const Goals = lazy(() => import("./pages/Goals"));
const CreateGoalPage = lazy(() => import("./pages/CreateGoalPage"));
const GoalDetailPage = lazy(() => import("./pages/GoalDetailPage"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetailPage = lazy(() => import("./pages/RecipeDetailPage"));
const ShoppingList = lazy(() => import("./pages/ShoppingList"));
const MyMeals = lazy(() => import("./pages/MyMeals"));
const Settings = lazy(() => import("./pages/Settings"));
const Progress = lazy(() => import("./pages/Progress"));
const ChallengesAndSummary = lazy(() => import("./pages/ChallengesAndSummary"));
const Profile = lazy(() => import("./pages/Profile"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCancel = lazy(() => import("./pages/SubscriptionCancel"));
// CBT/Mindfulness pages
const Mindfulness = lazy(() => import("./pages/Mindfulness"));
const MoodHistory = lazy(() => import("./pages/MoodHistory"));
const EmotionalEating = lazy(() => import("./pages/EmotionalEating"));
// Sensory & Routine Profile
const SensoryProfile = lazy(() => import("./pages/SensoryProfile"));
// Social pages
const Social = lazy(() => import("./pages/Social"));
const Discover = lazy(() => import("./pages/Discover"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

/**
 * Clears itself whenever the route changes.
 *
 * The outer boundary alone latched permanently: once any screen threw, every
 * subsequent navigation rendered the same error page, so the only escape was a
 * full reload. Keying on the pathname means walking away from a broken screen
 * is enough to recover.
 */
const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
};

const App = () => {
  // Clear expired cache on app start for better performance
  useEffect(() => {
    clearExpiredCacheSync();
    useWatchStore.getState().initialize();

    // Granting health permissions happens OUTSIDE the app — in Health Connect
    // or Apple Health. Re-check on resume so the connection lights up when the
    // user comes back, instead of them having to hunt for a Connect button.
    let remove: (() => void) | undefined;
    CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void useWatchStore.getState().refresh();
    })
      .then((handle) => {
        remove = () => handle.remove();
      })
      .catch(() => {
        /* web build - no native app lifecycle */
      });

    return () => remove?.();
  }, []);

  // Signed-in user's saved language preference is the cross-device source
  // of truth - reconcile it into the local store (and i18next) once known.
  const userLanguage = useAuthStore((state) => state.user?.language);
  const { language, setLanguage } = useLanguageStore();
  useEffect(() => {
    if (userLanguage && userLanguage !== language) {
      setLanguage(userLanguage);
    }
  }, [userLanguage, language, setLanguage]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WatchPermissionModal />
          <BrowserRouter>
            <BackNavigationHandler />
            <RouteErrorBoundary>
            <Suspense fallback={<MealLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/daily-tracker" element={<DailyTracker />} />
                <Route path="/weekly-overview" element={<WeeklyOverview />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/goals/create" element={<CreateGoalPage />} />
                <Route path="/goals/:goalId" element={<GoalDetailPage />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route
                  path="/recipes/:recipeId"
                  element={<RecipeDetailPage />}
                />
                <Route path="/my-meals" element={<MyMeals />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} />
                <Route
                  path="/challenges-summary"
                  element={<ChallengesAndSummary />}
                />
                <Route path="/subscription" element={<Subscription />} />
                <Route
                  path="/subscription/success"
                  element={<SubscriptionSuccess />}
                />
                <Route
                  path="/subscription/cancel"
                  element={<SubscriptionCancel />}
                />
                {/* CBT/Mindfulness Routes */}
                <Route path="/mindfulness" element={<Mindfulness />} />
                <Route path="/mindfulness/mood" element={<MoodHistory />} />
                <Route path="/mindfulness/emotional-eating" element={<EmotionalEating />} />
                {/* Sensory & Routine Profile */}
                <Route path="/sensory-profile" element={<SensoryProfile />} />
                {/* Social/Community Routes */}
                <Route path="/social" element={<Social />} />
                <Route path="/community" element={<Social />} />
                <Route path="/social/discover" element={<Discover />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </RouteErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
