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

export interface PlanTemplate {
  id: string;
  name: string;
  emoji: string;
  bestFor: string;
  description: string;
  includes: string[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "custom",
    name: "Custom Plan",
    emoji: "\u2728",
    bestFor: "Personalized to your goals",
    description:
      "AI generates a fully personalized plan based on your goals, preferences, and dietary needs.",
    includes: [
      "Goal-driven meal planning",
      "Macro targets from your profile",
      "Adapted to your fitness goals",
    ],
  },
  {
    id: "red-carpet-balance",
    name: "Red Carpet Balance",
    emoji: "\uD83C\uDF1F",
    bestFor: "Everyday wellness, busy schedules",
    description:
      "A flexible, feel-good plan built around whole foods, regular meals, and enjoyment.",
    includes: [
      "Balanced carbs, protein, and fats",
      "Simple breakfasts & satisfying dinners",
      "Built-in flexibility (80/20 style)",
    ],
  },
  {
    id: "high-performance-fuel",
    name: "High-Performance Fuel",
    emoji: "\uD83D\uDCAA",
    bestFor: "Active users, workouts, energy focus",
    description:
      "A performance-driven plan emphasizing protein, complex carbs, and nutrient timing.",
    includes: [
      "Higher protein meals",
      "Energy-focused snacks",
      "Recovery-friendly dinners",
    ],
  },
  {
    id: "plant-forward-glow",
    name: "Plant-Forward Glow",
    emoji: "\uD83C\uDF3F",
    bestFor: "Plant-based or light eaters",
    description:
      "A colorful, plant-first plan centered on vegetables, fruits, grains, and plant proteins.",
    includes: [
      "Fiber-rich meals",
      "Anti-inflammatory foods",
      "Light but filling recipes",
    ],
  },
  {
    id: "mindful-living",
    name: "Mindful Living",
    emoji: "\uD83E\uDDD8",
    bestFor: "Stress, digestion, routine building",
    description:
      "A gentle, nourishing plan focused on regular meals, simple ingredients, and mindful eating.",
    includes: [
      "Comfort-focused meals",
      "Easy-to-digest foods",
      "Routine-friendly portions",
    ],
  },
  {
    id: "modern-comfort",
    name: "Modern Comfort",
    emoji: "\u2728",
    bestFor: "Beginners, emotional eaters",
    description:
      "Familiar, comforting meals made healthier. Perfect for rebuilding a positive relationship with food.",
    includes: [
      "Familiar flavors",
      "Healthier swaps",
      'Zero "forbidden foods"',
    ],
  },
];

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
        className="max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6"
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

        <div className="space-y-3 mt-2">
          {PLAN_TEMPLATES.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => !isGenerating && setSelected(plan.id)}
                disabled={isGenerating}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-green-500 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${isGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {plan.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {plan.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 block">
                      {plan.bestFor}
                    </span>
                    {isSelected && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1.5">
                          {plan.description}
                        </p>
                        <ul className="space-y-0.5">
                          {plan.includes.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-500 flex items-center gap-1.5"
                            >
                              <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </button>
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
