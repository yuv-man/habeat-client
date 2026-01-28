import { useState, useRef, useEffect } from "react";
import { Plus, X, Activity, Cookie } from "lucide-react";

interface FloatingActionButtonProps {
  onAddWorkout: () => void;
  onAddSnack: () => void;
}

const FloatingActionButton = ({
  onAddWorkout,
  onAddSnack,
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAddWorkout = () => {
    setIsOpen(false);
    onAddWorkout();
  };

  const handleAddSnack = () => {
    setIsOpen(false);
    onAddSnack();
  };

  return (
    <div className="fixed bottom-24 right-4 z-50" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 mb-2 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {/* Add Workout Option */}
          <button
            onClick={handleAddWorkout}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 min-w-[160px]"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Add Workout
            </span>
          </button>

          {/* Add Snack Option */}
          <button
            onClick={handleAddSnack}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 min-w-[160px]"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cookie className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Add Snack
            </span>
          </button>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-700 rotate-45"
            : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        }`}
        aria-label="Add workout or snack"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton;
