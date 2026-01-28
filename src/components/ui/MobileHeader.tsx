import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, BarChart3, User } from "lucide-react";
//import logo from "@/assets/habeatIcon.png";
import logo from "@/assets/logos/app1.webp";
import { useAuthStore } from "@/stores/authStore";
import { ChatButton } from "@/components/chat";

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      icon: User,
      label: "Profile & Settings",
      path: "/profile",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/analytics",
    },
  ];

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 bg-green-50 border-b border-gray-200 z-50"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <Link to="/daily-tracker" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-auto" />
          <div className="text-lg font-semibold text-gray-900">Habeats</div>
        </Link>

        {/* Chat Button, Profile Picture and Burger Menu */}
        <div className="flex items-center gap-2">
          {/* Chat Button */}
          <div className="relative">
            <ChatButton variant="inline" />
          </div>

          {/* Profile Picture */}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition flex-shrink-0"
            aria-label="Profile"
          >
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
          </button>

          {/* Burger Menu Button
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${
                      location.pathname === item.path
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
