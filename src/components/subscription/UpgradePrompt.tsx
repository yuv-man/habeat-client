import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Sparkles } from "lucide-react";
import {
  getRequiredTier,
  FEATURE_DESCRIPTIONS,
  type FeatureKey,
} from "@/lib/subscription";

interface UpgradePromptProps {
  feature: FeatureKey;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Component that shows an upgrade prompt for a specific feature.
 * Automatically determines the required tier and shows appropriate messaging.
 */
export function UpgradePrompt({
  feature,
  title,
  description,
  className,
}: UpgradePromptProps) {
  const navigate = useNavigate();
  const requiredTier = getRequiredTier(feature);
  const featureDescription = FEATURE_DESCRIPTIONS[feature];

  const tierInfo = {
    plus: {
      name: "Plus",
      price: "$9.99/month",
      icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
    },
    premium: {
      name: "Premium",
      price: "$14.99/month",
      icon: <Crown className="h-5 w-5 text-purple-500" />,
    },
  };

  const info = tierInfo[requiredTier as "plus" | "premium"];

  if (!info) {
    // Feature is available in free tier
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {info.icon}
          <CardTitle>{title || `Upgrade to ${info.name}`}</CardTitle>
        </div>
        <CardDescription>{description || featureDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Get access to this feature and more with {info.name} for just{" "}
          {info.price}.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate("/subscription")} className="w-full">
          View Plans
        </Button>
      </CardFooter>
    </Card>
  );
}

interface UpgradeDialogContentProps {
  feature: FeatureKey;
  onClose?: () => void;
}

/**
 * Content for an upgrade dialog/modal.
 * Can be used with your preferred dialog component.
 */
export function UpgradeDialogContent({
  feature,
  onClose,
}: UpgradeDialogContentProps) {
  const navigate = useNavigate();
  const requiredTier = getRequiredTier(feature);
  const featureDescription = FEATURE_DESCRIPTIONS[feature];

  const handleUpgrade = () => {
    onClose?.();
    navigate("/subscription");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Crown className="mx-auto mb-4 h-12 w-12 text-purple-500" />
        <h2 className="mb-2 text-xl font-bold">
          Upgrade to{" "}
          {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
        </h2>
        <p className="text-muted-foreground">{featureDescription}</p>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-2 font-semibold">What you'll get:</h3>
        <ul className="space-y-1 text-sm">
          {requiredTier === "plus" && (
            <>
              <li>✓ All Star-Inspired Plans</li>
              <li>✓ Full weekly planning</li>
              <li>✓ Grocery list generation</li>
              <li>✓ Streak continuation</li>
            </>
          )}
          {requiredTier === "premium" && (
            <>
              <li>✓ Everything in Plus</li>
              <li>✓ Blended meal plans</li>
              <li>✓ Personalized portions</li>
              <li>✓ Weekly nutrition insights</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Maybe Later
        </Button>
        <Button onClick={handleUpgrade} className="flex-1">
          View Plans
        </Button>
      </div>
    </div>
  );
}
