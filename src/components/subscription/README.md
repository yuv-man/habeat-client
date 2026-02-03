# Subscription Components

This directory contains components for subscription management and feature gating.

## Components

### FeatureGate

Gates content based on user's subscription tier.

```tsx
import { FeatureGate } from "@/components/subscription/FeatureGate";

<FeatureGate feature="groceryList">
  <GroceryListComponent />
</FeatureGate>;
```

### FeatureButton

Button that shows upgrade prompt if user lacks access.

```tsx
import { FeatureButton } from "@/components/subscription/FeatureGate";

<FeatureButton feature="personalizedPortions" onClick={handleClick}>
  Generate Portions
</FeatureButton>;
```

### FeatureCheck

Render prop for conditional rendering based on feature access.

```tsx
import { FeatureCheck } from "@/components/subscription/FeatureGate";

<FeatureCheck feature="allStarInspiredPlans">
  {(hasAccess) => (hasAccess ? <AllPlans /> : <UpgradePrompt />)}
</FeatureCheck>;
```

## Available Features

- `starInspiredPlanLimited` - Free
- `mealsPerWeekBasic` - Free
- `streakCounter` - Free
- `allStarInspiredPlans` - Plus
- `fullWeeklyPlanning` - Plus
- `groceryList` - Plus
- `streakContinuation` - Plus
- `blendedPlans` - Premium
- `personalizedPortions` - Premium
- `weeklyInsights` - Premium

## See Also

- [Full Integration Guide](../../../SUBSCRIPTION_INTEGRATION.md)
- [useSubscription Hook](../../hooks/useSubscription.ts)
