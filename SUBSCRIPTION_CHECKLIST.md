# Subscription Integration Checklist

Use this checklist to verify your subscription integration is complete and working correctly.

## ✅ Pre-Integration Checklist

### Backend Setup

- [ ] Stripe account created
- [ ] Stripe API keys obtained (test and production)
- [ ] Backend subscription endpoints implemented:
  - [ ] `GET /api/subscription/details`
  - [ ] `POST /api/subscription/create-checkout-session`
  - [ ] `POST /api/subscription/create-portal-session`
  - [ ] `POST /api/subscription/change-tier`
  - [ ] `POST /api/subscription/cancel`
- [ ] Stripe webhook endpoint configured
- [ ] Webhook secret configured in backend
- [ ] User model has `subscriptionTier` field

### Frontend Setup

- [ ] Environment variables set in `.env`:
  - [ ] `VITE_BASE_URL_DEV`
  - [ ] `VITE_BASE_URL_PROD`
- [ ] Backend API is running and accessible
- [ ] User authentication is working

## ✅ Integration Verification

### Files Created

- [ ] `src/hooks/useSubscription.ts` exists
- [ ] `src/components/subscription/FeatureGate.tsx` exists
- [ ] `src/components/subscription/UpgradePrompt.tsx` exists
- [ ] `src/pages/Subscription.tsx` exists
- [ ] `src/pages/SubscriptionSuccess.tsx` exists
- [ ] `src/pages/SubscriptionCancel.tsx` exists

### Files Modified

- [ ] `src/types/interfaces.ts` has subscription types
- [ ] `src/services/api.ts` has subscription functions
- [ ] `src/lib/subscription.ts` has feature descriptions
- [ ] `src/App.tsx` has new routes

### Routes Working

- [ ] `/subscription` loads correctly
- [ ] `/subscription/success` loads correctly
- [ ] `/subscription/cancel` loads correctly
- [ ] Navigation between routes works

## ✅ Functionality Testing

### Viewing Subscription Plans

- [ ] Navigate to `/subscription`
- [ ] All three tiers displayed (Free, Plus, Premium)
- [ ] Current tier is highlighted
- [ ] Prices are correct ($9.99, $14.99)
- [ ] Features list is accurate
- [ ] "Current Plan" button shows for active tier

### Upgrade Flow (Test Mode)

- [ ] Click "Upgrade" on Plus tier
- [ ] Redirects to Stripe Checkout
- [ ] Checkout form loads correctly
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Enter any future expiry date
- [ ] Enter any 3-digit CVC
- [ ] Enter any ZIP code
- [ ] Click "Pay"
- [ ] Redirects to `/subscription/success`
- [ ] Success message displays
- [ ] User tier updates to "plus"
- [ ] Can navigate to dashboard

### Feature Gating

- [ ] Free user sees locked features
- [ ] Locked features show upgrade prompt
- [ ] Plus user can access Plus features
- [ ] Premium user can access all features
- [ ] `hasFeatureAccess()` returns correct values

### Billing Portal

- [ ] Navigate to `/subscription` as paid user
- [ ] "Manage Subscription" button visible
- [ ] Click "Manage Subscription"
- [ ] Redirects to Stripe Customer Portal
- [ ] Can view invoices
- [ ] Can update payment method
- [ ] Can cancel subscription
- [ ] Return URL works correctly

### Downgrade Flow

- [ ] As Plus/Premium user, click downgrade to Free
- [ ] Confirmation dialog appears
- [ ] Confirm downgrade
- [ ] Tier updates to "free"
- [ ] Lose access to premium features
- [ ] Success message displays

### Cancel Flow

- [ ] Start upgrade process
- [ ] Click browser back button or cancel
- [ ] Redirects to `/subscription/cancel`
- [ ] Cancel message displays
- [ ] Tier remains unchanged
- [ ] Can navigate back to plans

### Error Handling

- [ ] Network error shows user-friendly message
- [ ] Invalid card shows Stripe error
- [ ] Expired card shows Stripe error
- [ ] API error shows toast notification
- [ ] Loading states display correctly

## ✅ Component Testing

### FeatureGate Component

```tsx
<FeatureGate feature="groceryList">
  <div>Grocery List Content</div>
</FeatureGate>
```

- [ ] Free user: Shows upgrade prompt
- [ ] Plus user: Shows content
- [ ] Premium user: Shows content

### FeatureButton Component

```tsx
<FeatureButton feature="groceryList" onClick={handleClick}>
  Generate List
</FeatureButton>
```

- [ ] Free user: Shows "Upgrade to unlock"
- [ ] Plus user: Shows "Generate List" and works
- [ ] Premium user: Shows "Generate List" and works

### FeatureCheck Component

```tsx
<FeatureCheck feature="groceryList">
  {(hasAccess) => (hasAccess ? <Content /> : <Prompt />)}
</FeatureCheck>
```

- [ ] Free user: Renders prompt
- [ ] Plus user: Renders content
- [ ] Premium user: Renders content

### UpgradePrompt Component

```tsx
<UpgradePrompt feature="groceryList" />
```

- [ ] Shows correct tier (Plus)
- [ ] Shows feature description
- [ ] "View Plans" button works
- [ ] Navigates to `/subscription`

## ✅ Hook Testing

### useSubscription Hook

```tsx
const {
  subscription,
  loading,
  error,
  handleUpgrade,
  handleManageSubscription,
  handleChangeTier,
  handleCancelSubscription,
  refresh,
} = useSubscription();
```

- [ ] `subscription` loads correctly
- [ ] `loading` shows true while fetching
- [ ] `error` shows on API failure
- [ ] `handleUpgrade()` redirects to Stripe
- [ ] `handleManageSubscription()` opens portal
- [ ] `handleChangeTier()` updates tier
- [ ] `handleCancelSubscription()` cancels subscription
- [ ] `refresh()` reloads subscription data

## ✅ API Testing

### Get Subscription Details

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5080/api/subscription/details
```

- [ ] Returns subscription object
- [ ] Has `tier`, `status`, `currentPeriodEnd`
- [ ] Status is correct

### Create Checkout Session

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"plus","successUrl":"...","cancelUrl":"..."}' \
  http://localhost:5080/api/subscription/create-checkout-session
```

- [ ] Returns `{ url: "..." }`
- [ ] URL is valid Stripe checkout URL
- [ ] Can complete checkout

### Create Portal Session

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"returnUrl":"..."}' \
  http://localhost:5080/api/subscription/create-portal-session
```

- [ ] Returns `{ url: "..." }`
- [ ] URL is valid Stripe portal URL
- [ ] Can access portal

## ✅ User Experience

### UI/UX

- [ ] Tier cards are visually appealing
- [ ] "Most Popular" badge on Plus tier
- [ ] Tier icons display correctly
- [ ] Colors are consistent with brand
- [ ] Mobile responsive
- [ ] Loading states are smooth
- [ ] Error messages are clear
- [ ] Success messages are encouraging

### Navigation

- [ ] Back button works on all pages
- [ ] Breadcrumbs are correct (if applicable)
- [ ] Links to dashboard work
- [ ] Links to subscription page work
- [ ] Deep links work correctly

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast is sufficient
- [ ] Focus indicators visible
- [ ] ARIA labels present

## ✅ Edge Cases

### Authentication

- [ ] Logged out user redirected to login
- [ ] Expired token handled gracefully
- [ ] Invalid token shows error

### Subscription States

- [ ] Active subscription shows correctly
- [ ] Cancelled subscription shows warning
- [ ] Past due subscription shows alert
- [ ] Trialing subscription shows trial info

### Network Issues

- [ ] Offline mode handled
- [ ] Slow connection shows loading
- [ ] Timeout shows error message
- [ ] Retry mechanism works

### Race Conditions

- [ ] Multiple rapid clicks handled
- [ ] Concurrent API calls prevented
- [ ] State updates are atomic

## ✅ Production Readiness

### Security

- [ ] API keys not exposed in frontend
- [ ] Auth tokens stored securely
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly

### Performance

- [ ] Pages load quickly
- [ ] Images optimized
- [ ] Code splitting working
- [ ] No memory leaks

### Monitoring

- [ ] Errors logged to console
- [ ] Analytics tracking (if applicable)
- [ ] Stripe webhook logs checked
- [ ] User feedback collected

### Documentation

- [ ] Team knows how to use feature gating
- [ ] Subscription tiers documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide available

## ✅ Deployment

### Environment Variables

- [ ] Production API URL set
- [ ] Stripe production keys configured (backend)
- [ ] Webhook secret set (backend)
- [ ] Environment variables deployed

### Testing in Production

- [ ] Test with real card (small amount)
- [ ] Verify webhook fires
- [ ] Check subscription updates
- [ ] Test billing portal
- [ ] Test cancellation

### Rollback Plan

- [ ] Can revert to previous version
- [ ] Database backup available
- [ ] Stripe data preserved
- [ ] User data safe

## 📝 Notes

### Test Cards (Stripe Test Mode)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155

### Common Issues

1. **"Failed to create checkout session"**

   - Check backend is running
   - Verify API URL in `.env`
   - Check auth token is valid

2. **Subscription not updating**

   - Check webhook is configured
   - Verify webhook secret
   - Check webhook logs

3. **Feature gates not working**
   - Verify user has `subscriptionTier` field
   - Check feature key spelling
   - Ensure user data is loaded

### Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Quick Start Guide](./SUBSCRIPTION_QUICKSTART.md)
- [Integration Guide](./SUBSCRIPTION_INTEGRATION.md)
- [Examples](./INTEGRATION_EXAMPLES.md)

## ✅ Final Sign-Off

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Ready for production

---

**Date Completed**: ******\_\_\_******

**Tested By**: ******\_\_\_******

**Approved By**: ******\_\_\_******
