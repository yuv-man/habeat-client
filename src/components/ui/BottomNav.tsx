import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, ShoppingBag, Target } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/daily-tracker") {
      return location.pathname === "/daily-tracker";
    }
    if (path === "/weekly-overview") {
      return location.pathname === "/weekly-overview";
    }
    if (path === "/recipes") {
      return (
        location.pathname === "/recipes" ||
        location.pathname.startsWith("/recipes/")
      );
    }
    if (path === "/shopping-list") {
      return location.pathname === "/shopping-list";
    }
    if (path === "/goals") {
      return (
        location.pathname === "/goals" ||
        location.pathname.startsWith("/goals/")
      );
    }
    return location.pathname === path;
  };

  const NavButton = ({
    path,
    icon: Icon,
    label,
    isMain = false,
  }: {
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isMain?: boolean;
  }) => {
    const active = isActive(path);

    if (isMain) {
      return (
        <button
          onClick={() => navigate(path)}
          className={`flex flex-col items-center gap-1 py-2 px-4 min-w-0 transition-all relative ${
            active ? "text-green-600" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div
            className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full transition-all ${
              active
                ? "bg-green-100 shadow-lg shadow-green-200/50"
                : "bg-transparent"
            }`}
          />
          <Icon
            className={`relative z-10 transition-all ${
              active ? "w-7 h-7" : "w-6 h-6"
            }`}
          />
          <span
            className={`relative z-10 font-semibold transition-all ${
              active ? "text-[11px]" : "text-[10px]"
            }`}
          >
            {label}
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(path)}
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 transition-all relative ${
          active ? "text-green-600" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Icon
          className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`}
        />
        <span
          className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}
        >
          {label}
        </span>
        {active && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-600 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-50 shadow-lg">
      <div className="flex items-end justify-around max-w-md mx-auto">
        <NavButton path="/weekly-overview" icon={Calendar} label="Plan" />
        <NavButton path="/recipes" icon={Heart} label="Favorites" />
        <NavButton
          path="/daily-tracker"
          icon={Home}
          label="Today"
          isMain={true}
        />
        <NavButton path="/shopping-list" icon={ShoppingBag} label="Shop" />
        <NavButton path="/goals" icon={Target} label="Goals" />
      </div>
    </nav>
  );
};

export default BottomNav;
