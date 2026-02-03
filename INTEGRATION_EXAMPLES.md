# Subscription Integration Examples

This document provides practical examples of integrating subscription features into your components.

## Example 1: Gating a Feature in Weekly Overview

```tsx
// src/pages/WeeklyOverview.tsx
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";

function WeeklyOverview() {
  return (
    <div>
      <h1>Weekly Overview</h1>

      {/* Free users see limited content */}
      <BasicWeekView />

      {/* Plus and Premium users see full week planning */}
      <FeatureGate
        feature="fullWeeklyPlanning"
        fallback={<UpgradePrompt feature="fullWeeklyPlanning" />}
      >
        <FullWeekPlanningView />
      </FeatureGate>

      {/* Only Premium users see personalized insights */}
      <FeatureGate
        feature="weeklyInsights"
        fallback={<UpgradePrompt feature="weeklyInsights" />}
      >
        <WeeklyInsightsPanel />
      </FeatureGate>
    </div>
  );
}
```

## Example 2: Conditional Button in Shopping List

```tsx
// src/pages/ShoppingList.tsx
import { FeatureButton } from "@/components/subscription/FeatureGate";
import { FeatureCheck } from "@/components/subscription/FeatureGate";

function ShoppingList() {
  const handleGenerateList = () => {
    // Generate shopping list from meal plan
  };

  return (
    <div>
      <h1>Shopping List</h1>

      <FeatureCheck feature="groceryList">
        {(hasAccess) => (
          <>
            {hasAccess ? (
              <>
                <FeatureButton
                  feature="groceryList"
                  onClick={handleGenerateList}
                  variant="default"
                >
                  Generate from Meal Plan
                </FeatureButton>
                <ShoppingListContent />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">
                  Upgrade to Plus to automatically generate shopping lists from
                  your meal plans
                </p>
                <UpgradePrompt feature="groceryList" />
              </div>
            )}
          </>
        )}
      </FeatureCheck>
    </div>
  );
}
```

## Example 3: Settings Page with Subscription Management

```tsx
// src/pages/Settings.tsx
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, CreditCard } from "lucide-react";

function Settings() {
  const { subscription, handleManageSubscription, loading } = useSubscription();
  const { toast } = useToast();

  const openBillingPortal = async () => {
    try {
      await handleManageSubscription();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1>Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground capitalize">
                {subscription?.tier || "Free"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {subscription?.status || "Active"}
              </p>
            </div>
          </div>

          {subscription?.currentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}`
                  : `Renews on ${new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}`}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {subscription?.tier === "free" ? (
              <Button
                onClick={() => navigate("/subscription")}
                className="w-full"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            ) : (
              <Button
                onClick={openBillingPortal}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Other settings sections */}
    </div>
  );
}
```

## Example 4: Meal Plan Selection with Tier Restrictions

```tsx
// src/components/plan/PlanSelector.tsx
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { hasFeatureAccess } from "@/lib/subscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { Lock } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  requiredFeature: FeatureKey;
}

const AVAILABLE_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Simple, healthy meals",
    requiredFeature: "starInspiredPlanLimited",
  },
  {
    id: "athlete",
    name: "Athlete Plan",
    description: "High-protein, performance-focused",
    requiredFeature: "allStarInspiredPlans",
  },
  {
    id: "mediterranean",
    name: "Mediterranean Plan",
    description: "Heart-healthy Mediterranean diet",
    requiredFeature: "allStarInspiredPlans",
  },
  {
    id: "custom-blend",
    name: "Custom Blended Plan",
    description: "Mix and match from multiple plans",
    requiredFeature: "blendedPlans",
  },
];

function PlanSelector() {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const userTier = user?.subscriptionTier || "free";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AVAILABLE_PLANS.map((plan) => {
        const hasAccess = hasFeatureAccess(userTier, plan.requiredFeature);

        return (
          <div
            key={plan.id}
            className={`relative rounded-lg border p-4 transition-all ${
              hasAccess ? "cursor-pointer hover:border-primary" : "opacity-60"
            } ${selectedPlan === plan.id ? "border-primary bg-primary/5" : ""}`}
            onClick={() => hasAccess && setSelectedPlan(plan.id)}
          >
            {!hasAccess && (
              <div className="absolute right-2 top-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <h3 className="mb-2 font-semibold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>

            {!hasAccess && (
              <div className="mt-3">
                <UpgradePrompt
                  feature={plan.requiredFeature}
                  title="Unlock this plan"
                  className="border-0 bg-muted/50 p-3"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

## Example 5: Streak Freeze Feature (Plus Only)

```tsx
// src/components/streak/StreakDisplay.tsx
import { FeatureCheck } from "@/components/subscription/FeatureGate";
import { UpgradeDialogContent } from "@/components/subscription/UpgradePrompt";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Shield } from "lucide-react";

function StreakDisplay({ streak, hasStreakFreeze }: Props) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleStreakFreeze = () => {
    // Use streak freeze
    console.log("Using streak freeze");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-orange-500" />
        <span className="text-2xl font-bold">{streak} day streak</span>
      </div>

      <FeatureCheck feature="streakContinuation">
        {(hasAccess) => (
          <>
            {hasAccess ? (
              <Button
                onClick={handleStreakFreeze}
                disabled={!hasStreakFreeze}
                variant="outline"
                size="sm"
              >
                <Shield className="mr-2 h-4 w-4" />
                Use Streak Freeze {hasStreakFreeze
                  ? "(1 available)"
                  : "(None available)"}
              </Button>
            ) : (
              <Dialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Unlock Streak Freeze
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <UpgradeDialogContent
                    feature="streakContinuation"
                    onClose={() => setShowUpgradeDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </FeatureCheck>
    </div>
  );
}
```

## Example 6: Analytics with Premium Insights

```tsx
// src/pages/Analytics.tsx
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";

function Analytics() {
  return (
    <div className="space-y-6">
      <h1>Analytics</h1>

      {/* Basic analytics available to all users */}
      <section>
        <h2>This Week</h2>
        <BasicWeeklyStats />
      </section>

      {/* Advanced insights for Premium users */}
      <section>
        <h2>Weekly Insights</h2>
        <FeatureGate
          feature="weeklyInsights"
          fallback={
            <UpgradePrompt
              feature="weeklyInsights"
              title="Unlock Weekly Insights"
              description="Get personalized nutrition insights, trends, and recommendations based on your eating patterns"
            />
          }
        >
          <WeeklyInsightsPanel />
          <NutritionTrends />
          <PersonalizedRecommendations />
        </FeatureGate>
      </section>
    </div>
  );
}
```

## Example 7: Profile Page with Subscription Badge

```tsx
// src/pages/Profile.tsx
import { Crown, Star, Flame } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const TIER_BADGES = {
  free: { icon: Flame, color: "text-orange-500", label: "Free" },
  plus: { icon: Star, color: "text-yellow-500", label: "Plus" },
  premium: { icon: Crown, color: "text-purple-500", label: "Premium" },
};

function Profile() {
  const { user } = useAuthStore();
  const tier = user?.subscriptionTier || "free";
  const badge = TIER_BADGES[tier];
  const BadgeIcon = badge.icon;

  return (
    <div>
      <div className="flex items-center gap-4">
        <img
          src={user?.profilePicture}
          alt={user?.name}
          className="h-20 w-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <div className="flex items-center gap-2">
            <BadgeIcon className={`h-4 w-4 ${badge.color}`} />
            <span className="text-sm font-medium">{badge.label} Member</span>
          </div>
        </div>
      </div>

      {tier === "free" && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="mb-2 font-medium">Upgrade to unlock more features</p>
          <Button onClick={() => navigate("/subscription")} size="sm">
            View Plans
          </Button>
        </div>
      )}

      {/* Rest of profile content */}
    </div>
  );
}
```

## Testing Checklist

When testing subscription integration:

1. **Free Tier**

   - [ ] Can view basic features
   - [ ] Sees upgrade prompts for locked features
   - [ ] Can click upgrade buttons to navigate to subscription page

2. **Upgrade Flow**

   - [ ] Can select Plus or Premium tier
   - [ ] Redirects to Stripe Checkout
   - [ ] Can complete payment with test card (4242 4242 4242 4242)
   - [ ] Redirects to success page after payment
   - [ ] User data refreshes with new tier

3. **Plus Tier**

   - [ ] Can access all Plus features
   - [ ] Still sees upgrade prompts for Premium features
   - [ ] Can manage subscription via billing portal

4. **Premium Tier**

   - [ ] Can access all features
   - [ ] No upgrade prompts shown
   - [ ] Can manage subscription via billing portal

5. **Subscription Management**

   - [ ] Can open billing portal
   - [ ] Can update payment method
   - [ ] Can cancel subscription
   - [ ] Can view invoices

6. **Downgrade**
   - [ ] Can downgrade to free tier
   - [ ] Loses access to premium features immediately
   - [ ] User data updates correctly

## Common Patterns

### Pattern 1: Progressive Disclosure

Show users what they're missing to encourage upgrades:

```tsx
<div className="grid gap-4">
  {/* Show available features */}
  <AvailableFeatures />

  {/* Show locked features with preview */}
  <LockedFeaturePreview feature="weeklyInsights">
    <BlurredInsightsPreview />
    <UpgradePrompt feature="weeklyInsights" />
  </LockedFeaturePreview>
</div>
```

### Pattern 2: Inline Upgrade Prompts

Place upgrade prompts where users would naturally want the feature:

```tsx
<div className="space-y-4">
  <h2>Meal Plans</h2>
  <BasicPlanCard />

  {/* Inline upgrade prompt */}
  <FeatureGate feature="allStarInspiredPlans">
    <AdvancedPlanCards />
  </FeatureGate>
</div>
```

### Pattern 3: Feature Limits

Show usage limits and upgrade prompts when limits are reached:

```tsx
function MealPlanList() {
  const { user } = useAuthStore();
  const planCount = user?.plans?.length || 0;
  const maxPlans = user?.subscriptionTier === "free" ? 1 : Infinity;

  return (
    <div>
      {planCount >= maxPlans && (
        <UpgradePrompt
          feature="allStarInspiredPlans"
          title="Plan Limit Reached"
          description="Upgrade to Plus to create unlimited meal plans"
        />
      )}
      <PlanList plans={user?.plans} />
    </div>
  );
}
```
