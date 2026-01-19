import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  ShoppingCart,
  Heart,
  Home,
  User,
} from "lucide-react";
import logo from "@/assets/habeatIcon.png";
import "@/styles/navbar.css";
import { useAuthStore } from "@/stores/authStore";
import { ChatButton } from "@/components/chat";

interface NavBarProps {
  currentView?: "daily" | "weekly";
  onViewChange?: (view: "daily" | "weekly") => void;
}

const NavBar = ({ currentView = "daily", onViewChange }: NavBarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-row items-center gap-2">
            <img src={logo} alt="logo" className="w-12 h-12 md:w-16 md:h-16" />
            <div className="logo-text text-lg font-semibold">Habeats</div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Link
              className={`nav-link ${
                isActive("/daily-tracker") ? "active" : ""
              }`}
              to="/daily-tracker"
            >
              <Home className="w-5 h-5" />
              <div className="nav-link-text">Today</div>
            </Link>
            <Link
              className={`nav-link ${
                isActive("/weekly-overview") ? "active" : ""
              }`}
              to="/weekly-overview"
            >
              <Calendar className="w-5 h-5" />
              <div className="nav-link-text">Weekly Plan</div>
            </Link>
            <Link
              to="/recipes"
              className={`nav-link ${isActive("/recipes") ? "active" : ""}`}
            >
              <Heart className="w-5 h-5" />
              <div className="nav-link-text">Favorite Recipes</div>
            </Link>

            <Link
              to="/shopping-list"
              className={`nav-link ${
                isActive("/shopping-list") ? "active" : ""
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="nav-link-text">Shopping List</div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Chat Button */}
            <div className="relative">
              <ChatButton variant="inline" />
            </div>

            {/* Profile Picture */}
            <Link
              to="/profile"
              className={`nav-link flex items-center gap-2 ${
                isActive("/profile") || isActive("/settings") ? "active" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition flex-shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="nav-link-text">Settings</div>
            </Link>
          </div>
          <div className="mobile-view-toggle">
            <Link
              to="/daily-tracker"
              className={`p-2 rounded-full transition-colors ${
                currentView === "daily" || isActive("/daily-tracker")
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <Link
              to="/weekly-overview"
              className={`p-2 rounded-full transition-colors ${
                currentView === "weekly" || isActive("/weekly-overview")
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
