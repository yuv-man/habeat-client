import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/BottomNav";
import MobileHeader from "@/components/ui/MobileHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  showNavBar?: boolean;
  currentView?: "daily" | "weekly";
  bgColor?: string;
}

const DashboardLayout = ({
  children,
  showNavBar = true,
  currentView = "weekly",
  bgColor = "bg-gray-50",
}: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleViewChange = (view: "daily" | "weekly") => {
    if (view === "daily") {
      navigate("/daily-tracker");
    } else {
      navigate("/weekly-overview");
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} pt-14 md:pt-16 pb-16 md:pb-0`}>
      <MobileHeader />
      {showNavBar && (
        <NavBar currentView={currentView} onViewChange={handleViewChange} />
      )}
      {children}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
