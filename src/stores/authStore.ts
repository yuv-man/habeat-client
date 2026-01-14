import { create } from "zustand";
import {
  IUser,
  IMeal,
  IPlan,
  AuthState,
  AuthActions,
  MealTimes,
} from "@/types/interfaces";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockUser, mockPlan } from "@/mocks/planMock";
import {
  getCachedData,
  setCachedData,
  DEFAULT_TTL,
} from "@/lib/cache";

// Default meal times
const DEFAULT_MEAL_TIMES: MealTimes = {
  breakfast: "08:00",
  lunch: "12:30",
  dinner: "19:00",
  snacks: "15:00",
};

// Load meal times from localStorage or use defaults
const loadMealTimes = (): MealTimes => {
  try {
    const stored = localStorage.getItem("habeat_meal_times");
    if (stored) {
      return { ...DEFAULT_MEAL_TIMES, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error("Failed to load meal times:", err);
  }
  return DEFAULT_MEAL_TIMES;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  plan: null,
  loading: true,
  token: localStorage.getItem("token"),
  mealTimes: loadMealTimes(),
  favoriteMealsData: [],
  favoriteMealsLoaded: false,

  // Actions
  setUser: (user) => {
    set({ user });
    // Save user to localStorage (non-sensitive data only)
    if (user) {
      const userDataToStore = {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
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
  setMealTimes: (mealTimes) => {
    const currentMealTimes = get().mealTimes;
    const newMealTimes = { ...currentMealTimes, ...mealTimes };
    set({ mealTimes: newMealTimes });
    localStorage.setItem("habeat_meal_times", JSON.stringify(newMealTimes));
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
    const { user: cachedUser, plan: cachedPlan } = get();
    
    // Cache-first: If we have cached data, use it immediately and refresh in background
    if (cachedUser && cachedPlan) {
      // Set loading to false immediately to show cached data
      set({ loading: false });
      
      // Refresh in background
      try {
        const { user, plan } = await userAPI.fetchUser(token);
        get().setUser(user);
        get().setPlan(plan);
        // Cache the fresh data
        setCachedData("auth_user", user, DEFAULT_TTL.AUTH);
        if (plan) {
          setCachedData("auth_plan", plan, DEFAULT_TTL.PLAN);
        }
        onSuccess?.();
      } catch (error: any) {
        console.error("Error refreshing user data:", error);
        // Only logout if it's an auth error (401), not for network errors
        if (error?.response?.status === 401 || error?.message?.includes("401")) {
          get().logout();
        }
        // For other errors, keep using cached data
      }
      return;
    }

    // No cache available - fetch from API
    try {
      set({ loading: true });
      const { user, plan } = await userAPI.fetchUser(token);
      get().setUser(user);
      get().setPlan(plan);
      // Cache the fresh data
      setCachedData("auth_user", user, DEFAULT_TTL.AUTH);
      if (plan) {
        setCachedData("auth_plan", plan, DEFAULT_TTL.PLAN);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Error fetching user:", error);
      // Only logout if it's an auth error (401), not for network errors
      if (error?.response?.status === 401 || error?.message?.includes("401")) {
        get().logout();
      }
      // For other errors, try to load from cache if available
      const cachedUserData = getCachedData<IUser>("auth_user", { ttl: DEFAULT_TTL.AUTH });
      const cachedPlanData = getCachedData<IPlan>("auth_plan", { ttl: DEFAULT_TTL.PLAN });
      if (cachedUserData) {
        get().setUser(cachedUserData);
        if (cachedPlanData) {
          get().setPlan(cachedPlanData);
        }
      }
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

  // Direct Google Auth for mobile (uses Capacitor) or web (uses Google Identity Services)
  googleAuth: async (action: "signin" | "signup") => {
    try {
      // For signup, userId is not required (user doesn't exist yet)
      // For signin, userId is optional but can be used if available
      const userId = get().user?._id;
      
      set({ loading: true });
      console.log(`[googleAuth] Starting ${action} flow`);
      
      const { signInWithGoogle } = await import("@/lib/googleAuth");
      const { shouldUseMobileAuth } = await import("@/lib/platform");
      const idToken = await signInWithGoogle(action);
      
      console.log(`[googleAuth] Got idToken, length: ${idToken.length}`);

      // Determine which API endpoint to use based on auth mode
      const useMobile = shouldUseMobileAuth();
      console.log(`[googleAuth] Using ${useMobile ? 'mobile' : 'web'} API endpoint`);
      
      // Send idToken to backend using appropriate endpoint
      // For signup, userId is not required and will be ignored by backend
      // For signin, userId is optional - backend will handle both cases
      const response = useMobile
        ? await userAPI.mobileGoogleAuth(action, userId || "", idToken)
        : await userAPI.webGoogleAuth(action, userId || "", idToken);
      
      console.log(`[googleAuth] Got response from API:`, response);
      
      const { token, user, plan } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response from server: missing token or user");
      }

      get().setToken(token);
      get().setUser(user);
      get().setPlan(plan || null);

      // For signin, fetch plan if not returned
      if (action === "signin" && !plan) {
        const { plan: fetchedPlan } = await userAPI.fetchUser(token);
        get().setPlan(fetchedPlan);
      }
      set({ loading: false });
      console.log(`[googleAuth] ${action} completed successfully`);
    } catch (error) {
      console.error(`[googleAuth] Error during ${action}:`, error);
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
      const currentUser = get().user;
      const updatedUser = await userAPI.updateUser(id, data as IUser);
      // Merge updated user with current user to preserve fields the backend might not return
      const mergedUser = { ...currentUser, ...updatedUser };
      get().setUser(mergedUser as IUser);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    get().setToken(null);
    get().setUser(null);
    get().setPlan(null);
    set({ loading: false, favoriteMealsData: [], favoriteMealsLoaded: false });
    localStorage.removeItem("habeat_favorite_meals");
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
    const currentUser = get().user;
    const currentFavoriteMealsData = get().favoriteMealsData;

    // Optimistically update local state
    if (currentUser) {
      const currentFavorites = currentUser.favoriteMeals || [];
      const updatedFavorites = isFavorite
        ? [...currentFavorites, mealId]
        : currentFavorites.filter((id: string) => id !== mealId);

      const updatedUser = { ...currentUser, favoriteMeals: updatedFavorites };
      set({ user: updatedUser });

      // Also update favoriteMealsData if removing
      if (!isFavorite) {
        const updatedMealsData = currentFavoriteMealsData.filter(
          (meal) => meal._id !== mealId
        );
        set({ favoriteMealsData: updatedMealsData });
        localStorage.setItem(
          "habeat_favorite_meals",
          JSON.stringify(updatedMealsData)
        );
      }

      // Save to localStorage
      localStorage.setItem("habeat_user", JSON.stringify(updatedUser));
    }

    // Skip API call in test mode
    if (config.testFrontend) {
      return;
    }

    try {
      const { data } = await userAPI.updateFavorite(userId, mealId, isFavorite);
      // Update with server response
      set({ user: data });
      localStorage.setItem("habeat_user", JSON.stringify(data));

      // Refetch favorite meals data to get the updated list with full meal objects
      if (isFavorite) {
        // Only refetch when adding a new favorite to get the full meal data
        // Force refresh to bypass the cache check
        await get().fetchFavoriteMeals(userId, true);
      }
    } catch (error) {
      // Revert on error
      if (currentUser) {
        set({ user: currentUser });
        localStorage.setItem("habeat_user", JSON.stringify(currentUser));
      }
      set({ favoriteMealsData: currentFavoriteMealsData });
      localStorage.setItem(
        "habeat_favorite_meals",
        JSON.stringify(currentFavoriteMealsData)
      );
      throw error;
    }
  },

  setFavoriteMealsData: (meals) => {
    set({ favoriteMealsData: meals, favoriteMealsLoaded: true });
    localStorage.setItem("habeat_favorite_meals", JSON.stringify(meals));
  },

  fetchFavoriteMeals: async (userId: string, forceRefresh: boolean = false) => {
    // Skip if already loaded and not forcing refresh
    if (
      !forceRefresh &&
      get().favoriteMealsLoaded &&
      get().favoriteMealsData.length > 0
    ) {
      return;
    }

    // Skip API call in test mode
    if (config.testFrontend) {
      set({ favoriteMealsLoaded: true });
      return;
    }

    try {
      const response = await userAPI.getFavoritesByUserId(userId);
      // API returns { success: true, data: [...meals] }
      const meals = response.data || [];
      set({ favoriteMealsData: meals, favoriteMealsLoaded: true });
      localStorage.setItem("habeat_favorite_meals", JSON.stringify(meals));
    } catch (error) {
      console.error("Failed to fetch favorite meals:", error);
      set({ favoriteMealsLoaded: true }); // Mark as loaded even on error to prevent infinite retries
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

    // Load favorite meals from localStorage
    const storedFavoriteMeals = localStorage.getItem("habeat_favorite_meals");
    if (storedFavoriteMeals) {
      try {
        const favoriteMeals = JSON.parse(storedFavoriteMeals);
        // Only mark as loaded if we actually have data
        if (Array.isArray(favoriteMeals) && favoriteMeals.length > 0) {
          useAuthStore.setState({
            favoriteMealsData: favoriteMeals,
            favoriteMealsLoaded: true,
          });
        }
      } catch (err) {
        console.error("Failed to parse stored favorite meals:", err);
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
