# Subscription Locks Implementation

## Overview

Implemented subscription locks on premium features with smart upgrade prompts based on user behavior triggers.

## ✅ What Was Implemented

### 1. **Subscription Lock Utilities** (`src/lib/subscription.ts`)

Added helper functions for subscription checks:

- `isDevOrAdmin()` - Checks if user is in dev/admin mode (everything unlocked)
- `hasFeatureAccessWithBypass()` - Feature access check with dev bypass
- `canGenerateNewPlan()` - Checks if user can create a new plan (free = 1 plan limit)
- `shouldShowStreakUpgradePrompt()` - Checks if 5-day streak upgrade prompt should show

### 2. **Plan Generation Lock** (Trigger #2)

**Location**: `src/components/dashboard/PlanSelector.tsx`

**Behavior**:

- Free users can only have 1 active plan
- When trying to create a 2nd plan, shows locked state with upgrade prompt
- Copy: "You're building a habit ⭐ Keep it going with Plus."
- Regenerating existing plan (expired/replace) is always allowed

**Features**:

- Lock icon and gradient background
- Lists Plus benefits (unlimited plans, grocery lists, streak freeze)
- "Upgrade to Plus" button navigates to `/subscription`
- "Maybe Later" button closes modal

### 3. **5-Day Streak Prompt** (Trigger #1)

**Location**: `src/components/subscription/StreakUpgradePrompt.tsx`

**Behavior**:

- Shows automatically when free user reaches 5-day streak
- Only shows once (stored in localStorage)
- Copy: "You're building a habit ⭐ Keep it going with Plus."
- Displays current streak with flame icon

**Features**:

- Animated flame icon with streak number badge
- Highlights streak achievement
- Lists Plus benefits focused on streak protection
- Shows pricing ($9.99/month)
- "Upgrade to Plus" and "Maybe Later" buttons

### 4. **Dev/Admin Bypass**

**Behavior**:

- In development mode (`MODE=development` or `VITE_MODE=development`)
- In test mode (`VITE_TEST_FRONTEND=true`)
- All features unlocked
- No upgrade prompts shown
- No plan limits enforced

## 📋 Concrete Rules

### Rule 1: 5-Day Streak Trigger

```typescript
// Trigger conditions:
- User is on free tier
- Current streak >= 5 days
- Prompt hasn't been shown before (localStorage check)
- Not in dev/admin mode

// When triggered:
- Shows StreakUpgradePrompt modal
- Copy: "You're building a habit ⭐ Keep it going with Plus."
- Marks as seen in localStorage
```

### Rule 2: 2nd Plan Trigger

```typescript
// Trigger conditions:
- User is on free tier
- User already has 1 active plan
- User tries to create a NEW plan (not regenerate)
- Not in dev/admin mode

// When triggered:
- PlanSelector shows locked state
- Copy: "You're building a habit ⭐ Keep it going with Plus."
- Cannot select plans
- Must upgrade or cancel
```

### Rule 3: Dev/Admin Bypass

```typescript
// Bypass conditions:
- import.meta.env.MODE === "development"
- import.meta.env.VITE_MODE === "development"
- import.meta.env.VITE_TEST_FRONTEND === "true"

// When active:
- All features unlocked
- No upgrade prompts
- No plan limits
- Full access to everything
```

## 🎯 User Flows

### Flow 1: Free User Reaches 5-Day Streak

```
1. User logs meals for 5 consecutive days
2. On day 5, StreakUpgradePrompt automatically appears
3. User sees:
   - Flame icon with "5" badge
   - "You're building a habit ⭐"
   - "Keep it going with Plus."
   - Plus benefits (streak freeze, unlimited plans, grocery lists)
   - $9.99/month pricing
4. User can:
   - Click "Upgrade to Plus" → Navigate to /subscription
   - Click "Maybe Later" → Close modal, mark as seen
5. Prompt won't show again (localStorage)
```

### Flow 2: Free User Tries to Create 2nd Plan

```
1. User has 1 active plan
2. User clicks "Generate New Plan"
3. PlanSelector opens in LOCKED state
4. User sees:
   - Lock icon
   - "Unlock Multiple Plans" title
   - "You're building a habit ⭐ Keep it going with Plus."
   - "You've reached your plan limit"
   - Plus benefits list
5. User can:
   - Click "Upgrade to Plus" → Navigate to /subscription
   - Click "Maybe Later" → Close modal
6. User cannot select plans until upgraded
```

### Flow 3: Free User Regenerates Existing Plan

```
1. User's plan expires or they want to replace it
2. User clicks "Generate New Plan"
3. PlanSelector opens in NORMAL state (not locked)
4. User can select any plan template
5. Old plan is replaced with new one
6. No upgrade prompt shown (regeneration is allowed)
```

### Flow 4: Dev/Admin User

```
1. Developer runs app in development mode
2. All features automatically unlocked
3. No upgrade prompts appear
4. Can create unlimited plans
5. Can access all premium features
6. No subscription checks enforced
```

## 🔧 Implementation Details

### Files Modified

1. **`src/lib/subscription.ts`**

   - Added `isDevOrAdmin()`
   - Added `hasFeatureAccessWithBypass()`
   - Added `canGenerateNewPlan()`
   - Added `shouldShowStreakUpgradePrompt()`

2. **`src/components/dashboard/PlanSelector.tsx`**

   - Added `isRegeneration` prop
   - Added locked state UI
   - Added upgrade prompt in modal
   - Added plan limit check

3. **`src/components/subscription/StreakUpgradePrompt.tsx`** (NEW)

   - Created streak upgrade modal
   - Auto-shows at 5-day streak
   - localStorage tracking

4. **`src/components/layout/DashboardLayout.tsx`**

   - Added `<StreakUpgradePrompt />` component
   - Shows globally across app

5. **Updated PlanSelector calls:**
   - `src/components/dashboard/weeklyPlan.tsx`
   - `src/components/dashboard/ExpiredPlanCard.tsx`
   - `src/components/goals/Goals.tsx`
   - `src/components/layout/DashboardLayout.tsx`

### Key Code Patterns

**Check if user can generate plan:**

```typescript
import { canGenerateNewPlan } from "@/lib/subscription";

const userTier = user?.subscriptionTier || "free";
const currentPlanCount = plan ? 1 : 0;

const planCheck = canGenerateNewPlan(userTier, currentPlanCount);
if (!planCheck.canGenerate) {
  // Show locked state
}
```

**Check if in dev mode:**

```typescript
import { isDevOrAdmin } from "@/lib/subscription";

if (isDevOrAdmin()) {
  // Bypass all locks
  return true;
}
```

**Check for streak prompt:**

```typescript
import { shouldShowStreakUpgradePrompt } from "@/lib/subscription";

const shouldShow = shouldShowStreakUpgradePrompt(
  userTier,
  currentStreak,
  hasSeenPrompt
);
```

## 🎨 UI/UX Details

### Locked Plan Selector

**Visual Elements:**

- Purple-to-yellow gradient background
- Lock icon (16x16 purple)
- "You've reached your plan limit" heading
- Feature list with checkmarks
- "Upgrade to Plus" button (gradient purple-to-yellow)
- "Maybe Later" button (outline)

**Copy:**

```
Title: "Unlock Multiple Plans"
Subtitle: "You're building a habit ⭐ Keep it going with Plus."

Body:
"You've reached your plan limit"
"Free users can have 1 active plan. Upgrade to Plus to unlock unlimited plans and more features!"

Features:
✓ Unlimited meal plans
✓ All star-inspired plan templates
✓ Smart grocery lists
✓ Streak continuation & freeze
```

### Streak Upgrade Prompt

**Visual Elements:**

- Flame icon (orange-to-red gradient, 20x20)
- Streak badge (yellow circle with number)
- Orange-to-red gradient achievement banner
- Feature list with checkmarks
- Pricing display ($9.99/month)
- "Upgrade to Plus" button (gradient)
- "Maybe Later" button (outline)

**Copy:**

```
Title: "You're building a habit ⭐"
Subtitle: "Keep it going with Plus."

Achievement:
"5-Day Streak! 🎉"
"You're building amazing habits. Don't lose your momentum!"

Features:
"Protect your streak with Plus:"
✓ Streak Freeze: Miss a day without losing your streak
✓ Unlimited Plans: Try different meal plans anytime
✓ Smart Grocery Lists: Save time with auto-generated lists

Pricing:
"$9.99/month"
"Cancel anytime"
```

## 🧪 Testing

### Test Case 1: Dev Mode Bypass

```bash
# Set environment variable
VITE_MODE=development npm run dev

# Expected:
✓ All features unlocked
✓ No upgrade prompts
✓ Can create unlimited plans
✓ No subscription checks
```

### Test Case 2: 5-Day Streak Prompt

```
1. Set user to free tier
2. Set streak to 5 days (via engagement store)
3. Clear localStorage: localStorage.removeItem('habeat_streak_upgrade_prompt_seen')
4. Reload page

Expected:
✓ StreakUpgradePrompt appears automatically
✓ Shows "5-Day Streak!" message
✓ Shows Plus benefits
✓ "Upgrade to Plus" navigates to /subscription
✓ "Maybe Later" closes and marks as seen
✓ Doesn't show again after closing
```

### Test Case 3: 2nd Plan Lock

```
1. Set user to free tier
2. Ensure user has 1 active plan
3. Click "Generate New Plan"

Expected:
✓ PlanSelector opens in locked state
✓ Shows lock icon and upgrade message
✓ Cannot select plan templates
✓ "Upgrade to Plus" navigates to /subscription
✓ "Maybe Later" closes modal
```

### Test Case 4: Regeneration Allowed

```
1. Set user to free tier
2. Ensure user has 1 active plan
3. Plan expires
4. Click "Generate New Plan"

Expected:
✓ PlanSelector opens in NORMAL state (not locked)
✓ Can select any plan template
✓ Can generate new plan
✓ Old plan is replaced
```

## 📊 Analytics Tracking (Recommended)

Track these events for product insights:

```typescript
// When locked state is shown
analytics.track("subscription_lock_shown", {
  trigger: "second_plan_attempt",
  user_tier: "free",
  plan_count: 1,
});

// When streak prompt is shown
analytics.track("subscription_prompt_shown", {
  trigger: "five_day_streak",
  user_tier: "free",
  streak_count: 5,
});

// When user clicks upgrade
analytics.track("upgrade_clicked", {
  source: "plan_lock" | "streak_prompt",
  user_tier: "free",
});

// When user dismisses
analytics.track("upgrade_dismissed", {
  source: "plan_lock" | "streak_prompt",
  user_tier: "free",
});
```

## 🔄 Future Enhancements

### Potential Additions:

1. **More Triggers:**

   - 10-day streak prompt
   - After viewing 5 recipes
   - After using grocery list feature X times

2. **Smart Timing:**

   - Don't show prompts during onboarding
   - Space out prompts (e.g., max 1 per week)
   - Show at optimal times (after success moments)

3. **A/B Testing:**

   - Test different copy variations
   - Test different trigger thresholds
   - Test visual designs

4. **Backend Integration:**
   - Track plan count in backend
   - Sync prompt dismissals across devices
   - Server-side feature flags

## 🎯 Summary

**Implemented:**
✅ Plan generation lock (2nd plan trigger)
✅ 5-day streak upgrade prompt
✅ Dev/admin bypass for all locks
✅ Smart copy: "You're building a habit ⭐ Keep it going with Plus."
✅ Locked state UI with upgrade flow
✅ localStorage tracking for prompts

**Behavior:**

- Free users: 1 plan limit, prompts at 5-day streak
- Plus/Premium users: No restrictions
- Dev/Admin: Everything unlocked
- Regeneration: Always allowed

**User Experience:**

- Non-intrusive prompts
- Clear upgrade benefits
- Easy dismissal
- Contextual messaging
- Beautiful UI with gradients and icons
