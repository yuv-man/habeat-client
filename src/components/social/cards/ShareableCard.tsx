import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShareableCardProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
}

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ children, gradient = "from-emerald-500 to-teal-600", className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-[340px] overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-xl",
          gradient,
          className
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Habeat branding */}
        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/20 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="text-sm font-semibold text-white/90">Habeat</span>
          </div>
          <span className="text-xs text-white/60">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = "ShareableCard";

export default ShareableCard;
