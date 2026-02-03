# Plan Modal Integration - Summary

## Overview

Applied the `PlanSelector` modal to all "Generate Plan" buttons throughout the application when a plan is terminated or missing.

## Changes Made

### 1. ✅ ExpiredPlanCard.tsx

**Location**: `src/components/dashboard/ExpiredPlanCard.tsx`

**Changes**:

- Added `useState` for modal state management
- Imported `useAuthStore` to access user and `generateMealPlan`
- Imported `PlanSelector` component
- Added `openPlanSelector()` function
- Added `handlePlanSelect()` function to generate meal plan with selected template
- Updated "Generate New Plan" button to open modal instead of navigating
- Added `PlanSelector` component at the end

**Before**: Button navigated to `/weekly-overview`
**After**: Button opens `PlanSelector` modal

---

### 2. ✅ DashboardLayout.tsx

**Location**: `src/components/layout/DashboardLayout.tsx`

**Changes**:

- Added `useState` import
- Imported `PlanSelector` component
- Added state variables: `showPlanSelector`, `isGeneratingPlan`
- Added `user` and `generateMealPlan` from `useAuthStore`
- Updated `handleGeneratePlan()` to open modal instead of navigating
- Added `handlePlanSelect()` function to generate meal plan
- Added `PlanSelector` component before closing `</div>`

**Before**: Banner button navigated to `/weekly-overview`
**After**: Banner button opens `PlanSelector` modal

---

### 3. ✅ Goals.tsx

**Location**: `src/components/goals/Goals.tsx`

**Changes**:

- Imported `PlanSelector` component
- Added `user` and `generateMealPlan` from `useAuthStore`
- Added state variables: `showPlanSelector`, `isGenerating`
- Added `openPlanSelector()` function
- Added `handlePlanSelect()` function with error handling
- Updated "Generate Plan" button to open modal instead of navigating
- Added `disabled` prop to button when generating
- Added `PlanSelector` component before closing `</div>`

**Before**: Button navigated to `/weekly-overview`
**After**: Button opens `PlanSelector` modal

---

### 4. ✅ weeklyPlan.tsx (Already Implemented)

**Location**: `src/components/dashboard/weeklyPlan.tsx`

**Status**: Already using `PlanSelector` modal correctly

- No changes needed

---

## Benefits

### User Experience

1. **Consistent Flow**: All plan generation buttons now use the same modal
2. **Better UX**: Users can select their preferred plan template without navigation
3. **Faster**: No page navigation required
4. **Visual Feedback**: Modal shows loading state during generation

### Developer Experience

1. **Centralized Logic**: Plan selection logic is in one reusable component
2. **Consistent Behavior**: All buttons work the same way
3. **Maintainable**: Changes to plan selection only need to be made in one place

## Testing Checklist

### ExpiredPlanCard

- [ ] Navigate to daily tracker with expired plan
- [ ] Click "Generate New Plan" button
- [ ] Verify `PlanSelector` modal opens
- [ ] Select a plan template
- [ ] Click "Generate Plan"
- [ ] Verify plan is generated successfully
- [ ] Verify modal closes after generation

### DashboardLayout Banner

- [ ] Navigate to any page without a plan
- [ ] Verify amber banner appears at top
- [ ] Click "Generate Plan" button in banner
- [ ] Verify `PlanSelector` modal opens
- [ ] Select a plan template
- [ ] Click "Generate Plan"
- [ ] Verify plan is generated successfully
- [ ] Verify banner disappears after generation

### Goals Page

- [ ] Navigate to Goals page without a plan
- [ ] Verify "No Plan" banner appears
- [ ] Click "Generate Plan" button
- [ ] Verify `PlanSelector` modal opens
- [ ] Select a plan template
- [ ] Click "Generate Plan"
- [ ] Verify plan is generated successfully
- [ ] Verify banner disappears after generation

### Weekly Plan Page

- [ ] Navigate to Weekly Overview without a plan
- [ ] Click "AI Generate" button
- [ ] Verify `PlanSelector` modal opens
- [ ] Select a plan template
- [ ] Click "Generate Plan"
- [ ] Verify plan is generated successfully

### Expired Plan on Weekly Plan

- [ ] Navigate to Weekly Overview with expired plan
- [ ] Verify expired plan message appears
- [ ] Click "Generate New Plan" button
- [ ] Verify `PlanSelector` modal opens
- [ ] Select a plan template
- [ ] Click "Generate Plan"
- [ ] Verify new plan is generated successfully

## Code Pattern

All implementations follow this pattern:

```tsx
// 1. Imports
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import PlanSelector from "@/components/dashboard/PlanSelector";

// 2. State
const { user, generateMealPlan } = useAuthStore();
const [showPlanSelector, setShowPlanSelector] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);

// 3. Handlers
const openPlanSelector = () => {
  setShowPlanSelector(true);
};

const handlePlanSelect = async (planTemplateId: string) => {
  if (!user) return;
  try {
    setIsGenerating(true);
    await generateMealPlan(
      user,
      "My Plan",
      "en",
      planTemplateId === "custom" ? undefined : planTemplateId
    );
    setShowPlanSelector(false);
  } catch (error) {
    console.error("Failed to generate meal plan:", error);
  } finally {
    setIsGenerating(false);
  }
};

// 4. Button
<Button
  onClick={openPlanSelector}
  disabled={isGenerating}
>
  Generate Plan
</Button>

// 5. Modal Component
<PlanSelector
  open={showPlanSelector}
  onClose={() => setShowPlanSelector(false)}
  onSelect={handlePlanSelect}
  isGenerating={isGenerating}
/>
```

## Files Modified

1. `src/components/dashboard/ExpiredPlanCard.tsx`
2. `src/components/layout/DashboardLayout.tsx`
3. `src/components/goals/Goals.tsx`

## Files Not Modified

1. `src/components/dashboard/weeklyPlan.tsx` - Already implemented correctly
2. `src/components/dashboard/PlanSelector.tsx` - No changes needed (reusable component)

## No Breaking Changes

All changes are backward compatible and don't affect existing functionality. The modal integration is purely additive and improves the user experience.
