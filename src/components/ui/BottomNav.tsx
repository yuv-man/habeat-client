import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, Brain, Users } from "lucide-react";

const BottomNav = () => {
  const { t } = useTranslation("navigation");
  const navigate = useNavigate();
  const location = useLocation();

  const navRef = useRef<HTMLElement>(null);

  // Publish the bar's real height as --bottom-nav-h so floating elements (FABs)
  // can clear it. A hard-coded offset is not enough on Android: the gesture-bar
  // inset and the system font scale both make this bar taller than the design
  // height, which left the tracker's FAB sitting behind it.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const publish = () =>
      document.documentElement.style.setProperty(
        "--bottom-nav-h",
        `${el.offsetHeight}px`,
      );

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--bottom-nav-h");
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/daily-tracker") {
      return location.pathname === "/daily-tracker";
    }
    if (path === "/weekly-overview") {
      return location.pathname === "/weekly-overview";
    }
    if (path === "/progress") {
      return location.pathname === "/progress";
    }
    if (path === "/community") {
      return (
        location.pathname === "/community" || location.pathname === "/social"
      );
    }
    if (path === "/mindfulness") {
      return (
        location.pathname === "/mindfulness" ||
        location.pathname.startsWith("/mindfulness/")
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
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pt-2 md:hidden z-50 shadow-lg"
      // Sits above the home indicator rather than under it — without this the
      // bottom row of buttons is partly covered on devices that have one.
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavButton
          path="/daily-tracker"
          icon={Home}
          label={t("nav.today")}
          isMain={true}
        />
        <NavButton path="/weekly-overview" icon={Calendar} label={t("nav.plan")} />
        <NavButton path="/mindfulness" icon={Brain} label={t("nav.mind")} />
        <NavButton path="/progress" icon={BarChart3} label={t("nav.progress")} />
        <NavButton path="/community" icon={Users} label={t("nav.community")} />
      </div>
    </nav>
  );
};

export default BottomNav;
