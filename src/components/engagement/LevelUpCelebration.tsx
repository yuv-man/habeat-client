import { useEffect, useState, useRef, useCallback } from "react";
import { Trophy, Flame, Star, X, Target, Award } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

export function LevelUpCelebration() {
  // Use individual selectors for primitives to avoid object creation on every render
  const show = useEngagementStore((state) => state.showCelebration);
  const type = useEngagementStore((state) => state.celebrationType);
  const data = useEngagementStore((state) => state.celebrationData);
  
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  // Refs to track state and prevent duplicates
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCelebrationKeyRef = useRef<string | null>(null);
  const previousShowRef = useRef(false);
  const mountedRef = useRef(false);

  // Get dismiss function directly - Zustand functions are stable
  const dismissCelebration = useEngagementStore((state) => state.dismissCelebration);

  // Handle dismiss - stable callback
  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setTimeout(() => {
      dismissCelebration();
    }, 300);
  }, [dismissCelebration]);

  // Main effect - only runs when show changes (the key trigger)
  useEffect(() => {
    // Skip on initial mount - just track the initial state
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousShowRef.current = show;
      if (show && type && data) {
        // If already showing on mount, create the key but don't trigger animation
        const celebrationKey = `${type}-${data.habitScore || 0}-${data.milestone?.type || ''}-${data.streak || 0}-${data.badge?.id || ''}`;
        lastCelebrationKeyRef.current = celebrationKey;
      }
      return;
    }

    // Cleanup timer when show becomes false
    if (!show) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (previousShowRef.current) {
        setIsVisible(false);
        lastCelebrationKeyRef.current = null;
      }
      previousShowRef.current = false;
      return;
    }

    // Only process if show transitions from false to true
    const isNewCelebration = show && !previousShowRef.current;
    
    if (isNewCelebration && type) {
      // Get current data from store at this moment (not from closure)
      const currentData = useEngagementStore.getState().celebrationData;
      if (!currentData) {
        previousShowRef.current = true;
        return;
      }

      // Create a unique key for this celebration
      const celebrationKey = `${type}-${currentData.habitScore || 0}-${currentData.milestone?.type || ''}-${currentData.streak || 0}-${currentData.badge?.id || ''}`;
      
      // Only show if this is a different celebration than the last one
      if (celebrationKey !== lastCelebrationKeyRef.current) {
        // Cleanup any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        // Mark this celebration as shown
        lastCelebrationKeyRef.current = celebrationKey;
        previousShowRef.current = true;
        
        // Show the celebration
        setIsVisible(true);
        
        // Generate particles
        setParticles(
          Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
          }))
        );

        // Auto-dismiss - all celebrations get 5 seconds
        timerRef.current = setTimeout(() => {
          handleDismiss();
        }, 5000);
      } else {
        // Same celebration key, just update the ref
        previousShowRef.current = true;
      }
    } else if (show) {
      // Show is true but not a new celebration, just update ref
      previousShowRef.current = true;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [show, handleDismiss]); // Only depend on show and handleDismiss - NOT type or data

  if (!show) return null;

  const renderContent = () => {
    switch (type) {
      case "milestone":
        return (
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Milestone Reached!</h2>
            <p className="text-gray-600">{data?.milestone?.message}</p>
            <div className="flex items-center justify-center gap-1 text-green-500">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Habit Score: {data?.habitScore}</span>
            </div>
          </div>
        );

      case "badge":
        return (
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Achievement Unlocked!</h2>
            <p className="text-lg font-semibold text-purple-600">{data?.badge?.name}</p>
            <p className="text-sm text-gray-500">{data?.badge?.description}</p>
            <div className="flex items-center justify-center gap-1 text-green-500">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Habit Score: {data?.habitScore}</span>
            </div>
          </div>
        );

      case "streak":
        return (
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <Flame className="w-16 h-16 text-orange-500 animate-pulse" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                {data?.streak} days
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Consistency Win!</h2>
            <p className="text-gray-600">
              You're on a <span className="font-semibold text-orange-600">{data?.streak}-day</span> streak!
            </p>
            <p className="text-sm text-gray-500">Keep building your healthy habits</p>
          </div>
        );

      case "habitScore":
      default:
        return (
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Great Progress!</h2>
            <p className="text-gray-600">Your habit score is now</p>
            <div className="text-3xl font-bold text-blue-600">{data?.habitScore}</div>
          </div>
        );
    }
  };

  // All celebrations show as modals for habit-focused experience
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}%`,
              bottom: "-10px",
              background: type === "milestone"
                ? "linear-gradient(to right, #4ade80, #10b981)"
                : type === "badge"
                ? "linear-gradient(to right, #a855f7, #7c3aed)"
                : type === "streak"
                ? "linear-gradient(to right, #fb923c, #ea580c)"
                : "linear-gradient(to right, #60a5fa, #6366f1)",
              animation: `float-up 2s ease-out ${particle.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 transition-all duration-300",
          isVisible ? "scale-100" : "scale-90"
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        {renderContent()}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
