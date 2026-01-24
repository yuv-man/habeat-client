import { useState } from "react";
import {
  Leaf,
  Fish,
  MilkOff,
  WheatOff,
  Beef,
  Salad,
  Vegan,
  Plus,
  X,
  Apple,
} from "lucide-react";
import { KYCData, dietaryRestrictions } from "./types";
import KycLayout from "./KycLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DietaryRestrictionsStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Icon component for dietary restrictions
const DietIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  const iconProps = { className: className || "w-8 h-8", strokeWidth: 1.5 };

  switch (type) {
    case "vegan":
      return <Vegan {...iconProps} />;
    case "vegetarian":
      return <Leaf {...iconProps} />;
    case "pescatarian":
      return <Fish {...iconProps} />;
    case "dairy-free":
      return <MilkOff {...iconProps} />;
    case "gluten-free":
      return <WheatOff {...iconProps} />;
    case "paleo":
      return <Beef {...iconProps} />;
    case "low-carb":
      return <Salad {...iconProps} />;
    case "kosher":
      return <Apple {...iconProps} />;
    case "halal":
      return <Apple {...iconProps} />;
    case "other":
      return <Plus {...iconProps} />;
    default:
      return <Plus {...iconProps} />;
  }
};

export default function DietaryRestrictionsStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: DietaryRestrictionsStepProps) {
  const [otherRestriction, setOtherRestriction] = useState("");

  // Multi-selection for dietary restrictions
  const toggleRestriction = (restrictionId: string) => {
    setKycData((prev) => {
      const current = prev.dietaryRestrictions || [];
      const hasRestriction = current.includes(restrictionId);
      
      if (restrictionId === "other") {
        // Toggle "other" option
        if (hasRestriction) {
          // Remove "other" and any custom restrictions
          const customRestrictions = current.filter((r) => !r.startsWith("other:"));
          return {
            ...prev,
            dietaryRestrictions: customRestrictions.filter((r) => r !== "other"),
          };
        } else {
          // Add "other"
          return {
            ...prev,
            dietaryRestrictions: [...current, "other"],
          };
        }
      }
      
      return {
        ...prev,
        dietaryRestrictions: hasRestriction
          ? current.filter((r) => r !== restrictionId)
          : [...current, restrictionId],
      };
    });
  };

  const addOtherRestriction = () => {
    if (otherRestriction.trim()) {
      setKycData((prev) => {
        const current = prev.dietaryRestrictions || [];
        const customValue = `other:${otherRestriction.trim()}`;
        if (!current.includes(customValue)) {
          return {
            ...prev,
            dietaryRestrictions: [...current, customValue],
          };
        }
        return prev;
      });
      setOtherRestriction("");
    }
  };

  const removeOtherRestriction = (value: string) => {
    setKycData((prev) => {
      const current = prev.dietaryRestrictions || [];
      return {
        ...prev,
        dietaryRestrictions: current.filter((r) => r !== value),
      };
    });
  };

  const isRestrictionSelected = (restrictionId: string) =>
    (kycData.dietaryRestrictions || []).includes(restrictionId);
  
  // Get custom restrictions (those starting with "other:")
  const customRestrictions = (kycData.dietaryRestrictions || []).filter((r) =>
    r.startsWith("other:")
  );
  const hasOtherSelected = isRestrictionSelected("other");

  return (
    <KycLayout
      title="Dietary Restrictions"
      description="Select any dietary restrictions or preferences (optional)."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      {/* Dietary Restrictions Section - Multi Select */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Any dietary restrictions?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select all that apply (optional)
        </p>
        <div className="grid grid-cols-2 gap-3">
          {dietaryRestrictions.map((restriction) => {
            const selected = isRestrictionSelected(restriction.id);
            return (
              <button
                key={restriction.id}
                onClick={() => toggleRestriction(restriction.id)}
                className={`
                  flex flex-col items-center justify-center
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div
                  className={`mb-2 ${
                    selected ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  <DietIcon type={restriction.icon} className="w-8 h-8" />
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    selected ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  {restriction.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Dietary Restrictions Input */}
        {hasOtherSelected && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {customRestrictions.map((restriction) => {
                const value = restriction.replace("other:", "");
                return (
                  <div
                    key={restriction}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => removeOtherRestriction(restriction)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={otherRestriction}
                onChange={(e) => setOtherRestriction(e.target.value)}
                placeholder="Add custom dietary restriction"
                className="h-9 text-sm"
                onKeyPress={(e) => e.key === "Enter" && addOtherRestriction()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addOtherRestriction}
                size="sm"
                className="h-9 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </KycLayout>
  );
}
