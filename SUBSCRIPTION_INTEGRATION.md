# Subscription Integration Guide

This document explains how to use the Stripe subscription integration in the Habeat frontend.

## Table of Contents

1. [Overview](#overview)
2. [API Functions](#api-functions)
3. [Custom Hook](#custom-hook)
4. [Feature Gating](#feature-gating)
5. [Pages](#pages)
6. [Usage Examples](#usage-examples)

## Overview

The subscription system is integrated with Stripe and provides three tiers:

- **Free**: Basic features
- **Plus**: $9.99/month - Full meal planning features
- **Premium**: $14.99/month - Advanced personalization and insights

## API Functions

All subscription API functions are available through `userAPI`:

```typescript
import { userAPI } from "@/services/api";

// Get current subscription details
const { data } = await userAPI.getSubscriptionDetails();
// Returns: { tier, status, currentPeriodEnd, cancelAtPeriodEnd }

// Create checkout session for upgrade
const { data } = await userAPI.createCheckoutSession({
  tier: "plus", // or "premium"
  successUrl: `${window.location.origin}/subscription/success`,
  cancelUrl: `${window.location.origin}/subscription/cancel`,
});
// Returns: { url } - redirect user to this URL

// Create billing portal session
const { data } = await userAPI.createPortalSession({
  returnUrl: window.location.href,
});
// Returns: { url } - redirect user to this URL

// Change subscription tier
await userAPI.changeTier({ tier: "free" }); // or "plus" or "premium"

// Cancel subscription
await userAPI.cancelSubscription();
```

## Custom Hook

The `useSubscription` hook provides a convenient way to manage subscriptions:

```typescript
import { useSubscription } from "@/hooks/useSubscription";

function MyComponent() {
  const {
    subscription, // Current subscription details
    loading, // Loading state
    error, // Error message if any
    handleUpgrade, // Function to upgrade to a tier
    handleManageSubscription, // Function to open billing portal
    handleChangeTier, // Function to change tier
    handleCancelSubscription, // Function to cancel subscription
    refresh, // Function to refresh subscription data
  } = useSubscription();

  // Upgrade to Plus
  const upgradeToPlusClick = async () => {
    try {
      await handleUpgrade("plus");
      // User will be redirected to Stripe Checkout
    } catch (error) {
      console.error("Error upgrading:", error);
    }
  };

  // Open billing portal
  const manageBillingClick = async () => {
    try {
      await handleManageSubscription();
      // User will be redirected to Stripe Customer Portal
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <p>Current Plan: {subscription?.tier}</p>
      <p>Status: {subscription?.status}</p>
      <button onClick={upgradeToPlusClick}>Upgrade to Plus</button>
      <button onClick={manageBillingClick}>Manage Billing</button>
    </div>
  );
}
```

## Feature Gating

Use the feature gating components to restrict access based on subscription tier:

### FeatureGate Component

```typescript
import { FeatureGate } from "@/components/subscription/FeatureGate";

function MyComponent() {
  return (
    <FeatureGate feature="groceryList">
      {/* This content only shows to Plus and Premium users */}
      <GroceryListComponent />
    </FeatureGate>
  );
}

// With custom fallback
<FeatureGate
  feature="weeklyInsights"
  fallback={<div>Upgrade to Premium for weekly insights</div>}
>
  <WeeklyInsightsComponent />
</FeatureGate>

// Without upgrade button
<FeatureGate feature="blendedPlans" showUpgradeButton={false}>
  <BlendedPlansComponent />
</FeatureGate>
```

### FeatureButton Component

```typescript
import { FeatureButton } from "@/components/subscription/FeatureGate";

function MyComponent() {
  return (
    <FeatureButton
      feature="personalizedPortions"
      onClick={handleGeneratePortions}
      variant="default"
      size="lg"
    >
      Generate Personalized Portions
    </FeatureButton>
  );
}
```

If the user doesn't have access, the button automatically shows "Upgrade to unlock" and navigates to the subscription page.

### FeatureCheck Component

```typescript
import { FeatureCheck } from "@/components/subscription/FeatureGate";

function MyComponent() {
  return (
    <FeatureCheck feature="allStarInspiredPlans">
      {(hasAccess) => (
        <div>
          {hasAccess ? (
            <AllPlansGrid />
          ) : (
            <div>
              <LimitedPlansGrid />
              <UpgradePrompt />
            </div>
          )}
        </div>
      )}
    </FeatureCheck>
  );
}
```

### Programmatic Feature Checking

```typescript
import { hasFeatureAccess } from "@/lib/subscription";
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();
  const userTier = user?.subscriptionTier || "free";

  if (hasFeatureAccess(userTier, "groceryList")) {
    // User has access to grocery list
    generateGroceryList();
  } else {
    // Show upgrade prompt
    showUpgradeDialog();
  }
}
```

## Pages

### Subscription Page (`/subscription`)

Main page for viewing and managing subscriptions. Shows all available tiers with upgrade/downgrade buttons.

### Success Page (`/subscription/success`)

Shown after successful payment. Automatically refreshes user data to reflect new subscription tier.

### Cancel Page (`/subscription/cancel`)

Shown when user cancels the checkout process.

## Usage Examples

### Example 1: Complete Subscription Flow

```typescript
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

function SubscriptionManagement() {
  const { subscription, handleUpgrade, handleCancelSubscription } =
    useSubscription();
  const { toast } = useToast();

  const upgradeToPremium = async () => {
    try {
      await handleUpgrade("premium");
      // User redirected to Stripe Checkout
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  const cancelPlan = async () => {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
      await handleCancelSubscription();
      toast({
        title: "Success",
        description:
          "Subscription cancelled. You can continue using premium features until the end of your billing period.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2>Current Plan: {subscription?.tier}</h2>
      {subscription?.tier === "free" && (
        <button onClick={upgradeToPremium}>Upgrade to Premium</button>
      )}
      {subscription?.tier !== "free" && (
        <button onClick={cancelPlan}>Cancel Subscription</button>
      )}
    </div>
  );
}
```

### Example 2: Feature-Gated Component

```typescript
import {
  FeatureGate,
  FeatureButton,
} from "@/components/subscription/FeatureGate";

function WeeklyPlanningPage() {
  const handleGenerateWeekPlan = () => {
    // Generate full week plan
  };

  return (
    <div>
      <h1>Weekly Planning</h1>

      {/* Only Plus and Premium users can access */}
      <FeatureGate feature="fullWeeklyPlanning">
        <div>
          <FeatureButton
            feature="fullWeeklyPlanning"
            onClick={handleGenerateWeekPlan}
          >
            Generate Full Week Plan
          </FeatureButton>
        </div>
      </FeatureGate>

      {/* Only Premium users can access */}
      <FeatureGate feature="personalizedPortions">
        <PersonalizedPortionsSettings />
      </FeatureGate>
    </div>
  );
}
```

### Example 3: Conditional Rendering Based on Tier

```typescript
import { useAuthStore } from "@/stores/authStore";
import { hasFeatureAccess } from "@/lib/subscription";

function MealPlanSelector() {
  const { user } = useAuthStore();
  const userTier = user?.subscriptionTier || "free";
  const canAccessAllPlans = hasFeatureAccess(userTier, "allStarInspiredPlans");

  return (
    <div>
      <h2>Select a Meal Plan</h2>

      {/* Always show first plan */}
      <PlanCard plan={plans[0]} />

      {/* Show all plans or upgrade prompt */}
      {canAccessAllPlans ? (
        plans.slice(1).map((plan) => <PlanCard key={plan.id} plan={plan} />)
      ) : (
        <UpgradeCard
          title="Unlock All Plans"
          description="Upgrade to Plus to access all star-inspired meal plans"
          tier="plus"
        />
      )}
    </div>
  );
}
```

### Example 4: Settings Page with Subscription Info

```typescript
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();
  const { subscription, handleManageSubscription } = useSubscription();

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Subscription</h2>
        <div>
          <p>Current Plan: {subscription?.tier}</p>
          <p>Status: {subscription?.status}</p>

          {subscription?.currentPeriodEnd && (
            <p>
              Renews on:{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <p className="text-orange-600">
              Your subscription will be cancelled at the end of the billing
              period.
            </p>
          )}

          <div className="flex gap-2">
            {subscription?.tier === "free" ? (
              <button onClick={() => navigate("/subscription")}>
                Upgrade Plan
              </button>
            ) : (
              <button onClick={handleManageSubscription}>
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
```

## Available Features

The following features can be used with the feature gating system:

| Feature Key               | Required Tier | Description                              |
| ------------------------- | ------------- | ---------------------------------------- |
| `starInspiredPlanLimited` | Free          | Access limited star-inspired meal plans  |
| `mealsPerWeekBasic`       | Free          | Plan 3-5 meals per week                  |
| `streakCounter`           | Free          | Track your meal logging streak           |
| `allStarInspiredPlans`    | Plus          | Access all star-inspired meal plans      |
| `fullWeeklyPlanning`      | Plus          | Plan your entire week of meals           |
| `groceryList`             | Plus          | Generate smart grocery lists             |
| `streakContinuation`      | Plus          | Use streak freeze to maintain streak     |
| `blendedPlans`            | Premium       | Create custom blended meal plans         |
| `personalizedPortions`    | Premium       | Get personalized portion recommendations |
| `weeklyInsights`          | Premium       | Receive detailed weekly insights         |

## Testing

Use Stripe test cards in development:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Any future expiry date, any CVC, any ZIP code

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_API_URL=http://localhost:5080
# or for production:
# VITE_API_URL=https://api.your-domain.com
```

## Notes

- Subscription status is automatically synced with the backend via webhooks
- User data is refreshed after successful payment to reflect new tier
- The billing portal allows users to update payment methods, view invoices, and cancel subscriptions
- Downgrading to free tier is handled through the `changeTier` API
- All API calls require authentication (Bearer token)
