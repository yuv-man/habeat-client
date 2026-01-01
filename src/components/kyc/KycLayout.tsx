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
}: KycLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10">
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

