# Subscription Integration - Quick Start Guide

## What's Been Added

Your Habeat frontend now has full Stripe subscription integration with:

✅ **API Integration** - All subscription endpoints connected  
✅ **Custom Hook** - `useSubscription()` for easy subscription management  
✅ **Feature Gating** - Components to restrict features by tier  
✅ **UI Pages** - Subscription management, success, and cancel pages  
✅ **Type Safety** - Full TypeScript support

## Quick Start

### 1. Display Subscription Plans

```tsx
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  return <button onClick={() => navigate("/subscription")}>View Plans</button>;
}
```

### 2. Gate a Feature

```tsx
import { FeatureGate } from "@/components/subscription/FeatureGate";

function MyComponent() {
  return (
    <FeatureGate feature="groceryList">
      <GroceryListComponent />
    </FeatureGate>
  );
}
```

### 3. Check Feature Access

```tsx
import { hasFeatureAccess } from "@/lib/subscription";
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();
  const canAccess = hasFeatureAccess(
    user?.subscriptionTier || "free",
    "groceryList"
  );

  if (canAccess) {
    // Show feature
  } else {
    // Show upgrade prompt
  }
}
```

### 4. Manage Subscription

```tsx
import { useSubscription } from "@/hooks/useSubscription";

function MyComponent() {
  const { subscription, handleManageSubscription } = useSubscription();

  return (
    <div>
      <p>Plan: {subscription?.tier}</p>
      <button onClick={handleManageSubscription}>Manage Billing</button>
    </div>
  );
}
```

## Available Features

| Feature                   | Tier    | Description           |
| ------------------------- | ------- | --------------------- |
| `starInspiredPlanLimited` | Free    | Limited meal plans    |
| `mealsPerWeekBasic`       | Free    | 3-5 meals/week        |
| `streakCounter`           | Free    | Streak tracking       |
| `allStarInspiredPlans`    | Plus    | All meal plans        |
| `fullWeeklyPlanning`      | Plus    | Full week planning    |
| `groceryList`             | Plus    | Grocery lists         |
| `streakContinuation`      | Plus    | Streak freeze         |
| `blendedPlans`            | Premium | Custom blends         |
| `personalizedPortions`    | Premium | Personalized portions |
| `weeklyInsights`          | Premium | Weekly insights       |

## Key Files

### Components

- `src/components/subscription/FeatureGate.tsx` - Feature gating components
- `src/components/subscription/UpgradePrompt.tsx` - Upgrade prompts

### Pages

- `src/pages/Subscription.tsx` - Main subscription page
- `src/pages/SubscriptionSuccess.tsx` - Payment success page
- `src/pages/SubscriptionCancel.tsx` - Payment cancelled page

### Hooks & Utils

- `src/hooks/useSubscription.ts` - Subscription management hook
- `src/lib/subscription.ts` - Feature access utilities

### API

- `src/services/api.ts` - API functions (search for "SUBSCRIPTION API")
- `src/types/interfaces.ts` - TypeScript types

## Routes

The following routes are now available:

- `/subscription` - View and manage subscription plans
- `/subscription/success` - Payment success redirect
- `/subscription/cancel` - Payment cancelled redirect

## Testing

Use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry, any CVC, any ZIP

## Environment Setup

Make sure your `.env` has:

```env
VITE_BASE_URL_DEV=http://localhost:5080/api
VITE_BASE_URL_PROD=https://your-api-domain.com/api
```

## Next Steps

1. **Test the Integration**

   - Navigate to `/subscription`
   - Try upgrading with test card
   - Verify feature gating works

2. **Add Feature Gates**

   - Identify features to gate
   - Wrap them with `<FeatureGate>`
   - Add upgrade prompts

3. **Customize UI**
   - Update tier descriptions in `src/lib/subscription.ts`
   - Customize upgrade prompts
   - Add your branding

## Common Use Cases

### Show upgrade button for locked feature

```tsx
import { FeatureButton } from "@/components/subscription/FeatureGate";

<FeatureButton feature="groceryList" onClick={handleClick}>
  Generate Grocery List
</FeatureButton>;
```

### Conditionally render based on access

```tsx
import { FeatureCheck } from "@/components/subscription/FeatureGate";

<FeatureCheck feature="weeklyInsights">
  {(hasAccess) => (hasAccess ? <Insights /> : <UpgradePrompt />)}
</FeatureCheck>;
```

### Show subscription status in settings

```tsx
import { useSubscription } from "@/hooks/useSubscription";

function Settings() {
  const { subscription } = useSubscription();
  return <div>Plan: {subscription?.tier}</div>;
}
```

## Documentation

- **Full Guide**: [SUBSCRIPTION_INTEGRATION.md](./SUBSCRIPTION_INTEGRATION.md)
- **Examples**: [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
- **Components**: [src/components/subscription/README.md](./src/components/subscription/README.md)

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify API endpoints are correct in `.env`
3. Ensure backend subscription endpoints are running
4. Check that user has valid auth token
5. Review [SUBSCRIPTION_INTEGRATION.md](./SUBSCRIPTION_INTEGRATION.md) for detailed docs

## API Endpoints Used

The frontend calls these backend endpoints:

- `GET /api/subscription/details` - Get subscription details
- `POST /api/subscription/create-checkout-session` - Create Stripe checkout
- `POST /api/subscription/create-portal-session` - Create billing portal
- `POST /api/subscription/change-tier` - Change subscription tier
- `POST /api/subscription/cancel` - Cancel subscription

Make sure these are implemented in your backend!
