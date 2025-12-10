import { create } from "zustand";
import { IUser, IMeal, AuthState, AuthActions } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockUser, mockPlan } from "@/mocks/planMock";

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  plan: null,
  loading: true,
  token: localStorage.getItem("token"),

  // Actions
  setUser: (user) => {
    set({ user });
    // Save user to localStorage (non-sensitive data only)
    if (user) {
      const userDataToStore = {
        _id: user._id,
        email: user.email,
        name: user.name,
        // Don't store sensitive data like password, tokens, etc.
      };
      localStorage.setItem("habeat_user", JSON.stringify(userDataToStore));
    } else {
      localStorage.removeItem("habeat_user");
    }
  },
  setLoading: (loading) => set({ loading }),
  setPlan: (plan) => {
    set({ plan });
    // Save plan to localStorage
    if (plan) {
      localStorage.setItem("habeat_plan", JSON.stringify(plan));
    } else {
      localStorage.removeItem("habeat_plan");
    }
  },
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("habeat_user");
      localStorage.removeItem("habeat_plan");
    }
  },

  fetchUser: async (token: string, onSuccess?: () => void) => {
    try {
      const { user, plan } = await userAPI.fetchUser(token);
      get().setUser(user);
      get().setPlan(plan);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error fetching user:", error);
      // Only logout if it's an auth error (401), not for network errors
      // This prevents losing session on temporary network issues
      if (error?.response?.status === 401 || error?.message?.includes("401")) {
        get().logout();
      }
      // For other errors, keep the user data from localStorage
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const token = await userAPI.login(email, password);
      get().setToken(token);
      const { user, plan } = await userAPI.fetchUser(token);
      get().setUser(user);
      get().setPlan(plan);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, userData?: IUser) => {
    try {
      set({ loading: true });
      const { user, plan, token } = await userAPI.signup(
        email,
        password,
        userData
      );
      get().setToken(token);
      get().setUser(user);
      get().setPlan(plan);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  oauthSignin: async (provider: string) => {
    try {
      set({ loading: true });
      // Use redirect flow for all providers (including Google)
      // Backend handles the OAuth flow, gets the idToken from Google, verifies it, and redirects back
      const authUrl = await userAPI.initiateOAuth(provider, "signin");
      window.location.href = authUrl;
      // Note: loading state will be reset after redirect
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  oauthSignup: async (provider: string) => {
    try {
      set({ loading: true });
      // Initiate OAuth flow for sign-up
      const authUrl = await userAPI.initiateOAuth(provider, "signup");
      window.location.href = authUrl;
      // Note: loading state will be reset after redirect
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Handle OAuth callback with tokens
  handleOAuthCallback: async (
    provider: string,
    action: "signin" | "signup",
    userId?: string,
    accessToken?: string
  ) => {
    try {
      set({ loading: true });
      const response = await userAPI.oauthAuth(
        provider,
        action,
        userId,
        accessToken
      );
      const { token, user, plan } = response.data;
      get().setToken(token);
      get().setUser(user);
      get().setPlan(plan || null);

      // For signin, fetch plan if not returned
      if (action === "signin" && !plan) {
        const { plan: fetchedPlan } = await userAPI.fetchUser(token);
        get().setPlan(fetchedPlan);
      }
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  guestSignin: (userData: IUser) => {
    set({ loading: true });
    set({ user: userData, loading: false });
  },

  updateProfile: async (id: string, data: Partial<IUser>) => {
    try {
      set({ loading: true });
      const token = get().token;
      if (!token) {
        throw new Error("No token found");
      }
      const updatedUser = await userAPI.updateUser(id, data as IUser);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    get().setToken(null);
    get().setUser(null);
    get().setPlan(null);
    set({ loading: false });
  },

  generateMealPlan: async (
    userData: IUser,
    planName: string,
    language: string
  ) => {
    try {
      set({ loading: true });
      const { data } = await userAPI.generateMealPlan(
        userData,
        planName,
        language
      );

      set({ plan: data.plan, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateMealInPlan: async (userId: string, date: Date, meal: IMeal) => {
    try {
      set({ loading: true });
      const token = get().token;
      if (!token) {
        throw new Error("No token found");
      }
      const { data } = await userAPI.updateMealInPlan(userId, date, meal);
      console.log(data);
      set({ plan: data.plan, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateFavorite: async (
    userId: string,
    mealId: string,
    isFavorite: boolean
  ) => {
    try {
      set({ loading: true });
      const { data } = await userAPI.updateFavorite(userId, mealId, isFavorite);
      set({ user: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

// Initialize user on app start
if (typeof window !== "undefined") {
  if (config.testFrontend && import.meta.env.VITE_MODE !== "development") {
    // Test mode: use mock user and plan
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setToken("test_token");
    useAuthStore.getState().setLoading(false);
    // @ts-ignore - mockPlan is compatible but TypeScript doesn't recognize it
    useAuthStore.setState({ plan: mockPlan });
  } else {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("habeat_user");
    const storedPlan = localStorage.getItem("habeat_plan");

    // Load user and plan from localStorage first (for faster initial render)
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        useAuthStore.getState().setUser(user);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    if (storedPlan) {
      try {
        const plan = JSON.parse(storedPlan);
        useAuthStore.getState().setPlan(plan);
      } catch (err) {
        console.error("Failed to parse stored plan:", err);
      }
    }

    // If we have a token, fetch fresh data from server
    if (token) {
      useAuthStore.getState().fetchUser(token, () => {
        // Only auto-navigate if we're on the home page or auth callback
        // Don't redirect if user is already on a protected route
        const currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "/auth/callback") {
          // Check if user has completed KYC (has plan or other indicators)
          const state = useAuthStore.getState();
          if (state.user && state.plan) {
            window.location.href = "/daily-tracker";
          } else if (state.user && !state.plan) {
            // User exists but no plan - redirect to weekly overview to regenerate plan
            window.location.href = "/weekly-overview";
          } else {
            // No user - redirect to register
            window.location.href = "/register";
          }
        }
      });
    } else {
      useAuthStore.getState().setLoading(false);
    }
  }
}
