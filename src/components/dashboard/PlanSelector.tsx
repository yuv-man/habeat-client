import { useState } from "react";
import { Sparkles, Check } from "lucide-react";
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

interface PlanSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (planTemplateId: string) => void;
  isGenerating: boolean;
}

export default function PlanSelector({
  open,
  onClose,
  onSelect,
  isGenerating,
}: PlanSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

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
            Choose Your Plan
          </DialogTitle>
          <DialogDescription id="plan-selector-description">
            Pick a plan style that fits your lifestyle. All plans respect your
            allergies and food preferences.
          </DialogDescription>
        </DialogHeader>

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
                    <p className="text-sm text-gray-600">{plan.description}</p>
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
      </DialogContent>
    </Dialog>
  );
}
