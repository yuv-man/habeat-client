import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, ShoppingBag, Target } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <button
          onClick={() => navigate("/daily-tracker")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition ${
            isActive("/daily-tracker")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Today</span>
        </button>
        <button
          onClick={() => navigate("/weekly-overview")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition ${
            isActive("/weekly-overview")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-medium">Plan</span>
        </button>
        <button
          onClick={() => navigate("/recipes")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition ${
            isActive("/recipes")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">Favorites</span>
        </button>
        <button
          onClick={() => navigate("/shopping-list")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition ${
            isActive("/shopping-list")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="text-xs font-medium">Shop</span>
        </button>
        <button
          onClick={() => navigate("/goals")}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition ${
            isActive("/goals")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Target className="w-6 h-6" />
          <span className="text-xs font-medium">Goals</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
