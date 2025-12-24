import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, ShoppingBag, Target } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={() => navigate("/daily-tracker")}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition ${
            isActive("/daily-tracker")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Today</span>
        </button>
        <button
          onClick={() => navigate("/weekly-overview")}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition ${
            isActive("/weekly-overview")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Plan</span>
        </button>
        <button
          onClick={() => navigate("/recipes")}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition ${
            isActive("/recipes")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Favorites</span>
        </button>
        <button
          onClick={() => navigate("/shopping-list")}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition ${
            isActive("/shopping-list")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Shop</span>
        </button>
        <button
          onClick={() => navigate("/goals")}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition ${
            isActive("/goals")
              ? "text-green-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-medium">Goals</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
