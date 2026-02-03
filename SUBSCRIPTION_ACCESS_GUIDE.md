# How to Access Subscription Page & View Current Plan

## 🎯 Quick Answer

### How to Access Subscription Page

Users can access the subscription page in **3 ways**:

1. **From Profile Page** (Recommended)

   - Navigate to Profile (click profile icon in navbar or bottom nav)
   - Scroll to "Subscription" section
   - Click "Upgrade" or "Manage" button

2. **Direct URL**

   - Navigate to `/subscription` route
   - Example: `http://localhost:5173/subscription`

3. **From Upgrade Prompts**
   - Click any "Upgrade to unlock" button on locked features
   - Click "View Plans" in upgrade prompts

### How to See Current Plan

Users can see their current subscription tier in **4 places**:

1. **Profile Page** - Subscription section shows tier with icon and price
2. **Subscription Page** - Current tier is highlighted as "Current Plan"
3. **User Object** - `user.subscriptionTier` field ("free", "plus", or "premium")
4. **Upgrade Prompts** - Shows required tier for locked features

---

## 📍 Detailed Access Methods

### Method 1: Profile Page (Primary Method)

**Steps:**

1. Click profile icon in top navbar (desktop) or "Profile" in bottom nav (mobile)
2. You'll see your profile settings page
3. Scroll down to the "Subscription" section
4. You'll see:
   - Current plan tier with icon
   - Price (if paid plan)
   - "Upgrade" button (free tier) or "Manage" button (paid tier)
5. Click the button to go to subscription page

**Visual Indicators:**

- 🔥 Orange Sparkles = Free tier
- ⭐ Yellow Sparkles = Plus tier
- 👑 Purple Crown = Premium tier

**Code Location:**

```tsx
// src/pages/Profile.tsx
// Lines 831-878 (Subscription Section)
```

---

### Method 2: Direct Navigation

**URL Route:**

```
/subscription
```

**How to Navigate:**

```tsx
// From any component
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/subscription");
```

**Available Routes:**

- `/subscription` - Main subscription page
- `/subscription/success` - After successful payment
- `/subscription/cancel` - After cancelled payment

---

### Method 3: Upgrade Prompts

**Locations with Upgrade Prompts:**

1. **Feature Gates** - When trying to access locked features

   ```tsx
   <FeatureGate feature="groceryList">
     <GroceryListComponent />
   </FeatureGate>
   ```

2. **Upgrade Cards** - Throughout the app

   ```tsx
   <UpgradePrompt feature="weeklyInsights" />
   ```

3. **Feature Buttons** - Buttons that require higher tier
   ```tsx
   <FeatureButton feature="personalizedPortions">
     Generate Portions
   </FeatureButton>
   ```

All these show "Upgrade to unlock" or "View Plans" buttons that navigate to `/subscription`.

---

## 👀 Where Users See Their Current Plan

### 1. Profile Page - Subscription Section

**Location:** Profile → Settings Tab → Subscription Section

**What's Shown:**

- Plan tier name (Free, Plus, Premium)
- Tier icon (Sparkles or Crown)
- Price (for paid plans)
- Upgrade/Manage button
- Feature highlights (for free users)

**Example Display:**

```
┌─────────────────────────────────────┐
│ Subscription                        │
├─────────────────────────────────────┤
│ ⭐ Plus Plan                        │
│    $9.99/month              [Manage]│
└─────────────────────────────────────┘
```

---

### 2. Subscription Page

**Location:** `/subscription`

**What's Shown:**

- All three tiers (Free, Plus, Premium)
- Current tier highlighted with "Current Plan" button
- Features for each tier
- Upgrade/Downgrade buttons
- "Manage Subscription" button (for paid users)

**Example Display:**

```
Current Plan: Plus

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Free            │  │ Plus ⭐         │  │ Premium 👑      │
│ $0              │  │ $9.99/mo        │  │ $14.99/mo       │
│                 │  │                 │  │                 │
│ [Downgrade]     │  │ [Current Plan]  │  │ [Upgrade]       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

### 3. User Object (Programmatic)

**Access in Code:**

```tsx
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();

  // Get current tier
  const currentTier = user?.subscriptionTier; // "free" | "plus" | "premium"

  return <div>Current Plan: {currentTier}</div>;
}
```

**User Object Structure:**

```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  subscriptionTier: "free" | "plus" | "premium"; // ← Current plan
  // ... other fields
}
```

---

### 4. Feature Access Checks

**Check if user has access:**

```tsx
import { hasFeatureAccess } from "@/lib/subscription";
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();
  const userTier = user?.subscriptionTier || "free";

  // Check specific feature
  const canAccessGroceryList = hasFeatureAccess(userTier, "groceryList");

  if (!canAccessGroceryList) {
    return <UpgradePrompt feature="groceryList" />;
  }

  return <GroceryListComponent />;
}
```

---

## 🎨 Visual Indicators

### Tier Icons & Colors

| Tier    | Icon        | Color  | Price     |
| ------- | ----------- | ------ | --------- |
| Free    | 🔥 Sparkles | Orange | $0        |
| Plus    | ⭐ Sparkles | Yellow | $9.99/mo  |
| Premium | 👑 Crown    | Purple | $14.99/mo |

### In Code:

```tsx
// src/pages/Profile.tsx
{
  user.subscriptionTier === "free" && (
    <Sparkles className="w-5 h-5 text-orange-500" />
  );
}
{
  user.subscriptionTier === "plus" && (
    <Sparkles className="w-5 h-5 text-yellow-500" />
  );
}
{
  user.subscriptionTier === "premium" && (
    <Crown className="w-5 h-5 text-purple-500" />
  );
}
```

---

## 📱 Navigation Paths

### Desktop (Navbar)

```
Top Navbar → Profile Icon → Profile Page → Subscription Section
```

### Mobile (Bottom Nav)

```
Bottom Nav → Profile Tab → Profile Page → Subscription Section
```

### Direct

```
Any page → Navigate to /subscription
```

---

## 🔧 Implementation Details

### Files Modified

**Profile Page:**

- `src/pages/Profile.tsx`
- Added subscription section showing:
  - Current tier with icon
  - Price information
  - Upgrade/Manage button
  - Feature highlights for free users

**Key Code:**

```tsx
// src/pages/Profile.tsx (lines 831-878)
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  <h2 className="text-sm font-semibold text-gray-900 mb-3">Subscription</h2>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      {/* Tier icon */}
      <div>
        <p className="text-sm font-medium capitalize">
          {user.subscriptionTier || "Free"} Plan
        </p>
        <p className="text-xs text-gray-500">{/* Price info */}</p>
      </div>
    </div>
    <Button onClick={() => navigate("/subscription")}>
      {user.subscriptionTier === "free" ? "Upgrade" : "Manage"}
    </Button>
  </div>
  {/* Feature highlights for free users */}
</div>
```

---

## 🎯 User Journey Examples

### Example 1: Free User Wants to Upgrade

1. User clicks Profile icon
2. Sees "Free Plan" in Subscription section
3. Sees feature highlights (grocery lists, insights, etc.)
4. Clicks "Upgrade" button
5. Redirected to `/subscription` page
6. Selects Plus or Premium
7. Clicks "Upgrade" button
8. Redirected to Stripe Checkout
9. Completes payment
10. Redirected to `/subscription/success`
11. Returns to app with Plus/Premium tier

### Example 2: Paid User Wants to Manage Billing

1. User clicks Profile icon
2. Sees "Plus Plan - $9.99/month" in Subscription section
3. Clicks "Manage" button
4. Redirected to `/subscription` page
5. Clicks "Manage Subscription" button
6. Redirected to Stripe Customer Portal
7. Can update payment method, view invoices, cancel, etc.

### Example 3: User Checks Current Plan

1. User clicks Profile icon
2. Immediately sees current plan in Subscription section
3. No additional clicks needed

---

## 🚀 Quick Reference

### To Add Subscription Link Anywhere:

```tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

function MyComponent() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate("/subscription")}>
      <Crown className="w-4 h-4 mr-2" />
      View Plans
    </Button>
  );
}
```

### To Show Current Tier:

```tsx
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();

  return <div>Current Plan: {user?.subscriptionTier || "Free"}</div>;
}
```

### To Check Feature Access:

```tsx
import { hasFeatureAccess } from "@/lib/subscription";
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  const { user } = useAuthStore();
  const canAccess = hasFeatureAccess(
    user?.subscriptionTier || "free",
    "groceryList"
  );

  return canAccess ? <Feature /> : <UpgradePrompt />;
}
```

---

## ✅ Summary

**Subscription Page Access:**

1. ✅ Profile → Subscription section → Upgrade/Manage button
2. ✅ Direct URL: `/subscription`
3. ✅ Upgrade prompts throughout app

**Current Plan Visibility:**

1. ✅ Profile page - Subscription section (with icon & price)
2. ✅ Subscription page - Highlighted tier
3. ✅ User object - `user.subscriptionTier` field
4. ✅ Feature gates - Shows required tier

**Visual Indicators:**

- 🔥 Orange Sparkles = Free
- ⭐ Yellow Sparkles = Plus
- 👑 Purple Crown = Premium

All implementations are complete and ready to use!
