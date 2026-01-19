import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, User } from "lucide-react";

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
    if (path === "/progress") {
      return (
        location.pathname === "/progress" || location.pathname === "/analytics"
      );
    }
    if (path === "/profile") {
      return (
        location.pathname === "/profile" || location.pathname === "/settings"
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
          className={`flex flex-col items-center gap-1 py-1.5 px-3 min-w-0 transition-all relative ${
            active ? "text-green-600" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              active ? "bg-green-100" : "bg-transparent"
            }`}
          >
            <Icon
              className={`transition-all ${active ? "w-6 h-6" : "w-5 h-5"}`}
            />
          </div>
          <span
            className={`text-[10px] font-semibold transition-all ${
              active ? "text-green-600" : "text-gray-600"
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
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{label}</span>
        {active && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-600 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-50 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavButton
          path="/daily-tracker"
          icon={Home}
          label="Today"
          isMain={true}
        />
        <NavButton path="/weekly-overview" icon={Calendar} label="Plan" />
        <NavButton path="/progress" icon={BarChart3} label="Progress" />
        <NavButton path="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNav;
