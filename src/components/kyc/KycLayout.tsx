import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import MealLoader from "@/components/helper/MealLoader";

interface KycLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  submitText?: string;
  submitDisabled?: boolean;
  showBackButton?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export default function KycLayout({
  title,
  description,
  children,
  onBack,
  onSubmit,
  loading,
  error,
  submitText = "Next",
  submitDisabled = false,
  showBackButton = true,
  currentStep,
  totalSteps,
}: KycLayoutProps) {
  const progressPercentage =
    currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10">
        {/* Progress Bar */}
        {currentStep && totalSteps && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-4">
          {showBackButton ? (
            <button
              onClick={onBack}
              disabled={loading}
              className="p-1 text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8" /> // Spacer
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <div className="w-8" /> {/* Spacer for symmetry */}
        </div>
        <div className="h-1 bg-gradient-to-r from-green-300 to-green-400" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {description && (
          <p className="text-gray-600 text-sm mb-6">{description}</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {children}
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-gray-100">
        <button
          onClick={onSubmit}
          disabled={loading || submitDisabled}
          className={`
            w-full h-14 flex items-center justify-center gap-2
            font-semibold text-base rounded-full transition-all duration-200
            ${
              !submitDisabled
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-400"
            }
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <MealLoader size="small" />
          ) : (
            <>
              {submitText}
              {submitText !== "Complete Registration" && (
                <ChevronRight className="w-5 h-5" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

