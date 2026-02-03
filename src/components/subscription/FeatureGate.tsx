import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { hasFeatureAccess, type FeatureKey } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
}

/**
 * Component that gates features based on user's subscription tier.
 * Shows upgrade prompt if user doesn't have access.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeButton = true,
}: FeatureGateProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const userTier = user?.subscriptionTier || "free";
  const hasAccess = hasFeatureAccess(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradeButton) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate("/subscription")}
        className="w-full"
      >
        <Lock className="mr-2 h-4 w-4" />
        Upgrade to unlock
      </Button>
    );
  }

  return null;
}

interface FeatureButtonProps {
  feature: FeatureKey;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

/**
 * Button component that shows upgrade prompt if user doesn't have access to feature.
 */
export function FeatureButton({
  feature,
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
  disabled = false,
}: FeatureButtonProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const userTier = user?.subscriptionTier || "free";
  const hasAccess = hasFeatureAccess(userTier, feature);

  if (!hasAccess) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => navigate("/subscription")}
      >
        <Lock className="mr-2 h-4 w-4" />
        Upgrade to unlock
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

interface FeatureCheckProps {
  feature: FeatureKey;
  children: (hasAccess: boolean) => ReactNode;
}

/**
 * Render prop component that provides access status to children.
 * Useful for conditional rendering based on feature access.
 */
export function FeatureCheck({ feature, children }: FeatureCheckProps) {
  const { user } = useAuthStore();
  const userTier = user?.subscriptionTier || "free";
  const hasAccess = hasFeatureAccess(userTier, feature);

  return <>{children(hasAccess)}</>;
}
