import { ReactNode, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/BottomNav";
import MobileHeader from "@/components/ui/MobileHeader";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  showNavBar?: boolean;
  currentView?: "daily" | "weekly";
  bgColor?: string;
  hidePlanBanner?: boolean; // Allow pages to hide the banner
}

const DashboardLayout = ({
  children,
  showNavBar = true,
  currentView = "weekly",
  bgColor = "bg-gray-50",
  hidePlanBanner = false,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan } = useAuthStore();

  // Check if we're on Goals page
  const isGoalsPage = location.pathname === "/goals" || location.pathname.startsWith("/goals/");

  // Check if plan is missing or expired
  const showPlanBanner = useMemo(() => {
    if (hidePlanBanner || isGoalsPage) return false;
    
    // No plan at all
    if (!plan || !plan.weeklyPlan) return true;
    
    // Check if plan is expired
    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDateStr = dates[dates.length - 1];
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);
    
    return lastDate < today;
  }, [plan, hidePlanBanner, isGoalsPage]);

  const handleViewChange = (view: "daily" | "weekly") => {
    if (view === "daily") {
      navigate("/daily-tracker");
    } else {
      navigate("/weekly-overview");
    }
  };

  const handleGeneratePlan = () => {
    navigate("/weekly-overview");
  };

  return (
    <div className={`min-h-screen ${bgColor} pt-14 md:pt-16 pb-16 md:pb-0`}>
      <MobileHeader />
      {showNavBar && (
        <NavBar currentView={currentView} onViewChange={handleViewChange} />
      )}
      {showPlanBanner && (
        <div className="bg-amber-50 border-b-2 border-amber-400 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-sm md:text-base">
                  {!plan || !plan.weeklyPlan
                    ? "You don't have a meal plan yet"
                    : "Your meal plan has expired"}
                </p>
                <p className="text-amber-700 text-xs md:text-sm mt-0.5">
                  {!plan || !plan.weeklyPlan
                    ? "Generate a meal plan to start tracking your nutrition"
                    : "Generate a new plan to continue tracking your meals"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGeneratePlan}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-semibold px-4 py-2 flex items-center gap-2 flex-shrink-0"
              size="sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Plan</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </div>
        </div>
      )}
      {children}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
