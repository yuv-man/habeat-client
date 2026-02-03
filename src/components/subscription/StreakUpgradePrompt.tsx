import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useStreak } from "@/stores/engagementStore";
import { shouldShowStreakUpgradePrompt } from "@/lib/subscription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Crown, Check, X } from "lucide-react";

const STREAK_PROMPT_KEY = "habeat_streak_upgrade_prompt_seen";

export function StreakUpgradePrompt() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentStreak = useStreak();
  const [isOpen, setIsOpen] = useState(false);

  const userTier = user?.subscriptionTier || "free";

  useEffect(() => {
    // Check if we should show the prompt
    const hasSeenPrompt = localStorage.getItem(STREAK_PROMPT_KEY) === "true";

    if (shouldShowStreakUpgradePrompt(userTier, currentStreak, hasSeenPrompt)) {
      setIsOpen(true);
    }
  }, [userTier, currentStreak]);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as seen
    localStorage.setItem(STREAK_PROMPT_KEY, "true");
  };

  const handleUpgrade = () => {
    handleClose();
    navigate("/subscription");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <span className="text-sm font-bold">{currentStreak}</span>
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            You're building a habit ⭐
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Keep it going with Plus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Streak Achievement */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {currentStreak}-Day Streak! 🎉
            </p>
            <p className="text-xs text-gray-600">
              You're building amazing habits. Don't lose your momentum!
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Protect your streak with Plus:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Streak Freeze:</strong> Miss a day without losing your
                  streak
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Unlimited Plans:</strong> Try different meal plans
                  anytime
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Smart Grocery Lists:</strong> Save time with
                  auto-generated lists
                </span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              $9.99
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Cancel anytime</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 text-white hover:from-purple-700 hover:to-yellow-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Plus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
