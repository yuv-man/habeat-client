import { useAuthStore } from "@/stores/authStore";

// Numeric calories/macros default to visible; only hidden when the user
// explicitly turned them off (defaults to off for KYC's "very-emotional"
// food-relationship flag, see Kyc.tsx) — always overridable in Settings.
export function useShowMacros(): boolean {
  return useAuthStore((state) => state.user?.showMacros !== false);
}
