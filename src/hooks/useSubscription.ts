import { useState, useEffect, useCallback } from "react";
import { userAPI } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { SubscriptionDetails } from "@/types/interfaces";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuthStore();

  const loadSubscription = useCallback(async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getSubscriptionDetails();
      setSubscription(response.data);
    } catch (err) {
      console.error("Error loading subscription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleUpgrade = useCallback(
    async (tier: "plus" | "premium") => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      try {
        const response = await userAPI.createCheckoutSession({
          tier,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        });

        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } catch (err) {
        console.error("Error creating checkout session:", err);
        throw err;
      }
    },
    [token]
  );

  const handleManageSubscription = useCallback(async () => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await userAPI.createPortalSession({
        returnUrl: window.location.href,
      });

      // Redirect to Stripe Customer Portal
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error opening billing portal:", err);
      throw err;
    }
  }, [token]);

  const handleChangeTier = useCallback(
    async (tier: "free" | "plus" | "premium") => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      try {
        setLoading(true);
        await userAPI.changeTier({ tier });
        // Refresh subscription details
        await loadSubscription();
        // Refresh user data to get updated tier
        if (user?._id) {
          await useAuthStore.getState().fetchUser(token);
        }
      } catch (err) {
        console.error("Error changing tier:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, user, loadSubscription]
  );

  const handleCancelSubscription = useCallback(async () => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      setLoading(true);
      await userAPI.cancelSubscription();
      // Refresh subscription details
      await loadSubscription();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, loadSubscription]);

  return {
    subscription,
    loading,
    error,
    handleUpgrade,
    handleManageSubscription,
    handleChangeTier,
    handleCancelSubscription,
    refresh: loadSubscription,
  };
}
