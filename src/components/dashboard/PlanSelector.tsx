import { useState } from "react";
import { Sparkles, Check, Lock, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MealLoader from "@/components/helper/MealLoader";
import { PLAN_TEMPLATES } from "@/components/helper/planTypes";
import { useAuthStore } from "@/stores/authStore";
import { canGenerateNewPlan } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";

interface PlanSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (planTemplateId: string) => void;
  isGenerating: boolean;
  isRegeneration?: boolean; // If true, user is regenerating existing plan (not creating new)
}

export default function PlanSelector({
  open,
  onClose,
  onSelect,
  isGenerating,
  isRegeneration = false,
}: PlanSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { user, plan } = useAuthStore();
  const navigate = useNavigate();

  const userTier = user?.subscriptionTier || "free";
  const currentPlanCount = plan ? 1 : 0; // Simplified - you may want to track this in backend

  // Check if user can generate a new plan
  const planCheck = canGenerateNewPlan(userTier, currentPlanCount);
  const isLocked = !isRegeneration && !planCheck.canGenerate;

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSelected(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        aria-describedby="plan-selector-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isLocked ? "Unlock Multiple Plans" : "Choose Your Plan"}
          </DialogTitle>
          <DialogDescription id="plan-selector-description">
            {isLocked ? (
              <span className="text-amber-600">
                You're building a habit ⭐ Keep it going with Plus.
              </span>
            ) : (
              "Pick a plan style that fits your lifestyle. All plans respect your allergies and food preferences."
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Locked State - Show Upgrade Prompt */}
        {isLocked && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-yellow-50 border-2 border-purple-200 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                You've reached your plan limit
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Free users can have 1 active plan. Upgrade to Plus to unlock
                unlimited plans and more features!
              </p>

              {/* Features List */}
              <div className="bg-white rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  With Plus you get:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Unlimited meal plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>All star-inspired plan templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Smart grocery lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Streak continuation & freeze</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                    navigate("/subscription");
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 text-white hover:from-purple-700 hover:to-yellow-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Plus
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Normal State - Show Plan Selection */}
        {!isLocked && (
          <>
            <DialogHeader />

            {/* Big picture – one per line */}
            <div className="flex flex-col gap-4 mt-4">
              {PLAN_TEMPLATES.map((plan) => {
                const isSelected = selected === plan.id;
                return (
                  <div key={plan.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => !isGenerating && setSelected(plan.id)}
                      disabled={isGenerating}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-500/30 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      } ${isGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="w-full flex justify-center">
                        <img
                          src={plan.image}
                          alt=""
                          className="w-3/4 object-cover"
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                    {isSelected && (
                      <div className="mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {plan.description}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {plan.includes.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selected || isGenerating}
                className="flex-1 bg-green-500 text-white hover:bg-green-600"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <MealLoader size="small" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </span>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
