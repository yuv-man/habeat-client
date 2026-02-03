# Subscription Flow Diagrams

## User Upgrade Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Journey                            │
└─────────────────────────────────────────────────────────────┘

1. User sees locked feature
   ├─> FeatureGate component shows upgrade prompt
   └─> User clicks "Upgrade to unlock"

2. Navigate to /subscription
   ├─> Shows all available tiers
   ├─> Displays current plan
   └─> User selects Plus or Premium

3. Click "Upgrade" button
   ├─> useSubscription.handleUpgrade() called
   ├─> API: createCheckoutSession()
   └─> Redirect to Stripe Checkout

4. User completes payment on Stripe
   ├─> Stripe processes payment
   ├─> Stripe webhook notifies backend
   └─> Backend updates user tier

5. Redirect to /subscription/success
   ├─> Auto-refresh user data
   ├─> Show success message
   └─> User sees new tier

6. User now has access to feature
   └─> FeatureGate allows access
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Component Hierarchy                        │
└─────────────────────────────────────────────────────────────┘

App.tsx
├─> /subscription
│   └─> Subscription.tsx
│       ├─> useSubscription() hook
│       │   ├─> getSubscriptionDetails()
│       │   ├─> handleUpgrade()
│       │   └─> handleManageSubscription()
│       └─> TierCard components
│           └─> Upgrade/Downgrade buttons
│
├─> /subscription/success
│   └─> SubscriptionSuccess.tsx
│       └─> Auto-refresh user data
│
├─> /subscription/cancel
│   └─> SubscriptionCancel.tsx
│
└─> Any page with gated features
    └─> FeatureGate
        ├─> hasFeatureAccess() check
        ├─> Show content if access granted
        └─> Show UpgradePrompt if locked
```

## API Call Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     API Flow                                │
└─────────────────────────────────────────────────────────────┘

Frontend                    Backend                    Stripe
────────                    ────────                   ──────

1. Get Subscription Details
   │
   ├─> GET /api/subscription/details
   │                           │
   │                           └─> Query user's subscription
   │                           │
   │   <─── { tier, status } ──┘
   │

2. Create Checkout Session
   │
   ├─> POST /api/subscription/create-checkout-session
   │   { tier: "plus", successUrl, cancelUrl }
   │                           │
   │                           ├─> Create Stripe session
   │                           │                      │
   │                           │   <─── session ──────┘
   │                           │
   │   <─── { url } ───────────┘
   │
   └─> Redirect to Stripe Checkout URL

3. User Completes Payment
                                                       │
                            <─── Webhook ──────────────┘
                            │
                            └─> Update user tier in DB

4. Success Redirect
   │
   ├─> GET /api/users/me (refresh user data)
   │                           │
   │   <─── updated user ──────┘
   │

5. Manage Subscription
   │
   ├─> POST /api/subscription/create-portal-session
   │   { returnUrl }
   │                           │
   │                           ├─> Create portal session
   │                           │                      │
   │                           │   <─── session ──────┘
   │                           │
   │   <─── { url } ───────────┘
   │
   └─> Redirect to Stripe Customer Portal
```

## Feature Gating Flow

```
┌─────────────────────────────────────────────────────────────┐
│                Feature Access Check                         │
└─────────────────────────────────────────────────────────────┘

Component renders
    │
    ├─> <FeatureGate feature="groceryList">
    │       │
    │       ├─> Get user tier from useAuthStore
    │       │   (e.g., "free", "plus", "premium")
    │       │
    │       ├─> Call hasFeatureAccess(userTier, feature)
    │       │       │
    │       │       ├─> Look up required tier for feature
    │       │       │   (groceryList requires "plus")
    │       │       │
    │       │       └─> Compare tier ranks
    │       │           free: 0, plus: 1, premium: 2
    │       │
    │       ├─> If access granted (tier rank >= required)
    │       │   └─> Render children (feature content)
    │       │
    │       └─> If access denied
    │           └─> Render fallback or upgrade button
    │
    └─> Result: User sees feature or upgrade prompt
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                  State Flow                                 │
└─────────────────────────────────────────────────────────────┘

useAuthStore (Zustand)
├─> user
│   ├─> subscriptionTier: "free" | "plus" | "premium"
│   └─> other user data
│
├─> token (JWT)
│   └─> Used for API authentication
│
└─> Actions
    ├─> fetchUser() - Refresh user data
    ├─> setUser() - Update user in store
    └─> logout() - Clear user data

useSubscription (Custom Hook)
├─> subscription
│   ├─> tier
│   ├─> status
│   ├─> currentPeriodEnd
│   └─> cancelAtPeriodEnd
│
├─> loading (boolean)
├─> error (string | null)
│
└─> Actions
    ├─> handleUpgrade(tier)
    ├─> handleManageSubscription()
    ├─> handleChangeTier(tier)
    ├─> handleCancelSubscription()
    └─> refresh()
```

## Data Flow Example

```
┌─────────────────────────────────────────────────────────────┐
│          Example: User Upgrades to Plus                     │
└─────────────────────────────────────────────────────────────┘

Initial State:
├─> user.subscriptionTier = "free"
└─> hasFeatureAccess("free", "groceryList") = false

User clicks "Upgrade to Plus":
├─> handleUpgrade("plus") called
├─> createCheckoutSession({ tier: "plus", ... })
├─> Redirect to Stripe
└─> User completes payment

Stripe webhook fires:
├─> Backend receives webhook
├─> Backend updates user.subscriptionTier = "plus"
└─> User redirected to /subscription/success

Success page loads:
├─> fetchUser(token) called
├─> Backend returns updated user
├─> useAuthStore.setUser({ ...user, subscriptionTier: "plus" })
└─> UI updates automatically

Final State:
├─> user.subscriptionTier = "plus"
├─> hasFeatureAccess("plus", "groceryList") = true
└─> FeatureGate now renders grocery list content
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Error Scenarios                            │
└─────────────────────────────────────────────────────────────┘

API Call Fails
├─> try/catch in useSubscription hook
├─> Set error state
├─> Show toast notification
└─> User can retry

Payment Fails
├─> Stripe shows error message
├─> User can update payment method
└─> No changes to user tier

User Cancels Checkout
├─> Redirect to /subscription/cancel
├─> Show cancellation message
└─> No changes to user tier

Network Error
├─> API call times out
├─> Error caught and logged
├─> Show user-friendly error message
└─> User can retry

Webhook Fails
├─> Stripe retries webhook
├─> Backend logs error
├─> Manual reconciliation if needed
└─> User may need to contact support
```

## Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Testing Checklist                          │
└─────────────────────────────────────────────────────────────┘

1. Feature Gating
   ├─> Free user sees locked features
   ├─> Plus user sees Plus features
   ├─> Premium user sees all features
   └─> Upgrade prompts show correct tier

2. Upgrade Flow
   ├─> Click upgrade button
   ├─> Redirect to Stripe Checkout
   ├─> Enter test card: 4242 4242 4242 4242
   ├─> Complete payment
   ├─> Redirect to success page
   └─> Verify tier updated

3. Billing Portal
   ├─> Click "Manage Subscription"
   ├─> Redirect to Stripe portal
   ├─> Can view invoices
   ├─> Can update payment method
   └─> Can cancel subscription

4. Downgrade
   ├─> Click downgrade to free
   ├─> Confirm action
   ├─> Tier updated immediately
   └─> Lose access to premium features

5. Cancel Flow
   ├─> Start checkout
   ├─> Click back/cancel
   ├─> Redirect to cancel page
   └─> No changes to tier
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│              Where to Add Feature Gates                     │
└─────────────────────────────────────────────────────────────┘

Weekly Planning Page
├─> Full week view (Plus+)
└─> Personalized portions (Premium)

Shopping List Page
├─> Auto-generate from plan (Plus+)
└─> Smart suggestions (Plus+)

Analytics Page
├─> Basic stats (Free)
├─> Weekly trends (Plus+)
└─> Personalized insights (Premium)

Meal Plans Page
├─> 1 plan (Free)
├─> All plans (Plus+)
└─> Blended plans (Premium)

Profile/Settings
├─> Streak counter (Free)
├─> Streak freeze (Plus+)
└─> Advanced customization (Premium)
```

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                  Common Patterns                            │
└─────────────────────────────────────────────────────────────┘

Gate entire section:
<FeatureGate feature="groceryList">
  <GroceryListSection />
</FeatureGate>

Gate with custom fallback:
<FeatureGate
  feature="weeklyInsights"
  fallback={<UpgradePrompt feature="weeklyInsights" />}
>
  <InsightsPanel />
</FeatureGate>

Conditional button:
<FeatureButton
  feature="personalizedPortions"
  onClick={handleGenerate}
>
  Generate Portions
</FeatureButton>

Render prop pattern:
<FeatureCheck feature="blendedPlans">
  {(hasAccess) => (
    hasAccess ? <AdvancedUI /> : <BasicUI />
  )}
</FeatureCheck>

Programmatic check:
const canAccess = hasFeatureAccess(
  user?.subscriptionTier || "free",
  "groceryList"
);
```
