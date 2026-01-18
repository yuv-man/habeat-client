import { useEffect } from "react";
import { X, Star, Trophy, Sparkles } from "lucide-react";
import { useChallengeStore } from "../../stores/challengeStore";
import { cn } from "../../lib/utils";

export function ChallengeClaimCelebration() {
  // Use individual selectors instead of combined selector to prevent object recreation
  const show = useChallengeStore((state) => state.showClaimCelebration);
  const data = useChallengeStore((state) => state.claimedChallenge);
  const dismissClaimCelebration = useChallengeStore((state) => state.dismissClaimCelebration);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        dismissClaimCelebration();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, dismissClaimCelebration]);

  if (!show || !data) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={dismissClaimCelebration}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={cn(
            "bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full pointer-events-auto",
            "animate-bounce-in"
          )}
        >
          {/* Close button */}
          <button
            onClick={dismissClaimCelebration}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse-slow">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              {/* Sparkles */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-2 w-5 h-5 text-amber-300 animate-pulse delay-150" />
              <Sparkles className="absolute top-1/2 -right-4 w-4 h-4 text-yellow-400 animate-pulse delay-300" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            Challenge Complete!
          </h2>

          {/* Challenge Name */}
          <p className="text-center text-gray-600 mb-4">
            {data.challenge.title}
          </p>

          {/* XP Reward */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-lg font-bold text-amber-700">
                +{data.xpAwarded} XP
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={dismissClaimCelebration}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </>
  );
}
