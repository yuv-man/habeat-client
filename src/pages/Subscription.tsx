import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Flame, Star, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TIERS,
  type SubscriptionTier,
  type TierDefinition,
} from "@/lib/subscription";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const TIER_ICONS: Record<SubscriptionTier, React.ReactNode> = {
  free: <Flame className="h-6 w-6 text-orange-500" />,
  plus: <Star className="h-6 w-6 text-yellow-500" />,
  premium: <Crown className="h-6 w-6 text-purple-500" />,
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: "border-orange-200 bg-orange-50",
  plus: "border-yellow-300 bg-yellow-50",
  premium: "border-purple-300 bg-purple-50",
};

const TIER_BUTTON_COLORS: Record<SubscriptionTier, string> = {
  free: "bg-orange-500 hover:bg-orange-600",
  plus: "bg-yellow-500 hover:bg-yellow-600 text-black",
  premium: "bg-purple-600 hover:bg-purple-700",
};

function TierCard({
  tier,
  currentTier,
  onUpgrade,
  onDowngrade,
  isProcessing,
}: {
  tier: TierDefinition;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: "plus" | "premium") => void;
  onDowngrade: () => void;
  isProcessing: boolean;
}) {
  const isCurrentTier = tier.id === currentTier;
  const isHighlighted = tier.id === "plus";

  const handleClick = () => {
    if (tier.price === 0) {
      onDowngrade();
    } else {
      onUpgrade(tier.id as "plus" | "premium");
    }
  };

  return (
    <div
      className={`relative rounded-2xl border-2 p-5 transition-shadow ${
        TIER_COLORS[tier.id]
      } ${isHighlighted ? "shadow-lg ring-2 ring-yellow-400" : "shadow-sm"}`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-black">
          Most Popular
        </span>
      )}

      <div className="mb-3 flex items-center gap-2">
        {TIER_ICONS[tier.id]}
        <h3 className="text-lg font-bold">{tier.name}</h3>
      </div>

      <p className="mb-4 text-2xl font-extrabold">
        {tier.price === 0 ? (
          "Free"
        ) : (
          <>
            ${tier.price}
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </>
        )}
      </p>

      <ul className="mb-5 space-y-2">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentTier ? (
        <Button disabled variant="outline" className="w-full">
          Current Plan
        </Button>
      ) : (
        <Button
          onClick={handleClick}
          disabled={isProcessing}
          className={`w-full text-white ${TIER_BUTTON_COLORS[tier.id]}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>{tier.price === 0 ? "Downgrade" : "Upgrade"}</>
          )}
        </Button>
      )}
    </div>
  );
}

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { handleUpgrade, handleChangeTier, handleManageSubscription } =
    useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier: SubscriptionTier = user?.subscriptionTier || "free";

  const onUpgrade = async (tier: "plus" | "premium") => {
    try {
      setIsProcessing(true);
      await handleUpgrade(tier);
      // User will be redirected to Stripe Checkout
    } catch (error) {
      console.error("Error upgrading:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const onDowngrade = async () => {
    if (!confirm("Are you sure you want to downgrade to the free plan?")) {
      return;
    }

    try {
      setIsProcessing(true);
      await handleChangeTier("free");
      toast({
        title: "Success",
        description: "Your plan has been downgraded to Free",
      });
    } catch (error) {
      console.error("Error downgrading:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to downgrade plan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onManageSubscription = async () => {
    try {
      setIsProcessing(true);
      await handleManageSubscription();
      // User will be redirected to Stripe Customer Portal
    } catch (error) {
      console.error("Error managing subscription:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to open billing portal",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-4 pb-24 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1.5 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Choose Your Plan</h1>
        </div>

        {/* Current subscription info */}
        {currentTier !== "free" && (
          <div className="mx-auto mb-4 max-w-md rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold capitalize">{currentTier}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onManageSubscription}
                disabled={isProcessing}
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              currentTier={currentTier}
              onUpgrade={onUpgrade}
              onDowngrade={onDowngrade}
              isProcessing={isProcessing}
            />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-xs text-muted-foreground">
          You can change or cancel your plan at any time.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
