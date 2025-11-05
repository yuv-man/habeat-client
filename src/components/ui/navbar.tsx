import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, ShoppingCart, Heart, Home, Settings } from 'lucide-react';
import { useState } from 'react';
import logo from "@/assets/habeatIcon.png";
import "@/styles/navbar.css";
import { UserSettingsModal } from "@/components/modals/UserSettingsModal";

interface NavBarProps {
  currentView?: 'daily' | 'weekly';
  onViewChange?: (view: 'daily' | 'weekly') => void;
}

const NavBar = ({ currentView = 'daily', onViewChange }: NavBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleDashboardToggle = (view: 'daily' | 'weekly') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
        <div className='flex flex-row items-center gap-2'>
            <img src={logo} alt="logo" className="w-12 h-12 md:w-16 md:h-16" />
            <div className="logo-text text-lg font-semibold">Habeat</div>
        </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Link className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                <Home className="w-5 h-5" />
                <div className="nav-link-text">Dashboard</div>
            </Link>
            <Link
              to="/recipes"
              className={`nav-link ${isActive('/recipes') ? 'active' : ''}`}
            >
              <Heart className="w-5 h-5" />
              <div className="nav-link-text">Favorite Recipes</div>
            </Link>

            <Link
              to="/shopping-list"
              className={`nav-link ${isActive('/shopping-list') ? 'active' : ''}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="nav-link-text">Shopping List</div>
            </Link>
          </div>
          <div className="view-toggle bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleDashboardToggle('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'daily'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => handleDashboardToggle('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'weekly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Weekly
              </button>
          </div>
          <UserSettingsModal>
              <button className="nav-link">
                <Settings className="w-5 h-5" />
              </button>
            </UserSettingsModal>
          <div className="mobile-view-toggle">
            <button
              onClick={() => handleDashboardToggle('daily')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'daily'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDashboardToggle('weekly')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'weekly'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;