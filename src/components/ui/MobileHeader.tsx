import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import logo from "@/assets/habeatIcon.png";

const MobileHeader = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        <Link to="/daily-tracker" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-10 h-10" />
          <div className="text-lg font-semibold text-gray-900">Habeat</div>
        </Link>
        {!isSettingsPage && (
          <Link
            to="/settings"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
