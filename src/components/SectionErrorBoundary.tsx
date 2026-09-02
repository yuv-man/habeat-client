import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";

interface SectionErrorBoundaryProps {
  children: ReactNode;
  /** Names the thing that broke, e.g. "challenges". Used in the message so the
   *  user knows what they've lost and what still works. */
  label: string;
  resetKey?: string;
}

/**
 * Fails small.
 *
 * The app has a single boundary at the router, which means a throw anywhere —
 * a stats banner, one card in a list — blanks the entire screen including the
 * navigation, leaving no way out but a reload. That is a wildly
 * disproportionate response to a widget that couldn't render.
 *
 * Wrapping a section in this keeps the failure the size of the section. The
 * rest of the page, and crucially the nav, stay usable.
 */
export function SectionErrorBoundary({
  children,
  label,
  resetKey,
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      resetKey={resetKey}
      fallback={
        <div
          role="status"
          className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              Couldn't load {label}
            </p>
            {/* Says what survived, because the useful information here is that
                the rest of the page is fine. */}
            <p className="text-xs text-gray-500 mt-0.5">
              Everything else on this page still works. It'll retry next time
              you open this screen.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default SectionErrorBoundary;
