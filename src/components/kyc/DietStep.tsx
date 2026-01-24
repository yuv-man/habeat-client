import {
  Nut,
  Apple,
  Heart,
  Dumbbell,
  Timer,
  Scale,
} from "lucide-react";
import { KYCData, dietGoals } from "./types";
import KycLayout from "./KycLayout";

interface DietStepProps {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Icon component for diet goals
const DietIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  const iconProps = { className: className || "w-8 h-8", strokeWidth: 1.5 };

  switch (type) {
    case "keto":
      return <Nut {...iconProps} />;
    case "healthy-balance":
      return <Heart {...iconProps} />;
    case "muscle-up":
      return <Dumbbell {...iconProps} />;
    case "running":
      return (
        <svg
          className={iconProps.className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={iconProps.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="17" cy="4" r="2" />
          <path d="M15.59 13.51l-2.18-2.23a1.5 1.5 0 00-2.12 0l-3.88 3.88a1.5 1.5 0 000 2.12l2.64 2.64" />
          <path d="M9.5 5.5L7 8l-4 1 1-4 2.5-2.5" />
          <path d="M14 17l2.5 2.5 4-1-1 4-2.5 2.5" />
          <path d="M19 12l-7-7" />
        </svg>
      );
    case "lose-weight":
      return <Scale {...iconProps} />;
    case "fasting":
      return <Timer {...iconProps} />;
    default:
      return <Apple {...iconProps} />;
  }
};

export default function DietStep({
  kycData,
  setKycData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: DietStepProps) {
  // Single selection for diet goal
  const selectDietGoal = (goalId: string) => {
    setKycData((prev) => ({
      ...prev,
      dietType: prev.dietType === goalId ? "" : goalId,
    }));
  };

  const isGoalSelected = (goalId: string) => kycData.dietType === goalId;
  const hasGoalSelection = kycData.dietType && kycData.dietType.length > 0;

  return (
    <KycLayout
      title="Diet Goal"
      description="Select your health and fitness goal."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Continue"
      submitDisabled={!hasGoalSelection}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      {/* Diet Goals Section - Single Select */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          What's your goal?
        </h3>
        <p className="text-sm text-gray-500 mb-4">Choose one</p>
        <div className="grid grid-cols-2 gap-3">
          {dietGoals.map((goal) => {
            const selected = isGoalSelected(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => selectDietGoal(goal.id)}
                className={`
                  flex flex-col items-center justify-center
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    selected
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div
                  className={`mb-2 ${
                    selected ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  <DietIcon type={goal.icon} className="w-8 h-8" />
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    selected ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  {goal.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </KycLayout>
  );
}
