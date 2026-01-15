import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MealLoader from "@/components/helper/MealLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { clearExpiredCacheSync } from "@/lib/cache";
import BackNavigationHandler from "@/components/navigation/BackNavigationHandler";

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
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  // Clear expired cache on app start for better performance
  useEffect(() => {
    clearExpiredCacheSync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BackNavigationHandler />
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
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
