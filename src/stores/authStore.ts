import { create } from 'zustand';
import { IUser, IPlan, IMeal } from '@/types/interfaces';
import { userAPI } from '@/services/api';

interface AuthState {
  user: IUser | null;
  loading: boolean;
  token: string | null;
  plan: IPlan | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: IUser ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  setUser: (user: IUser | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  fetchUser: (token: string, onSuccess?: () => void) => Promise<void>;
  oauthSignin: (provider: string) => Promise<void>;
  oauthSignup: (provider: string) => Promise<void>;
  handleOAuthCallback: (provider: string, action: 'signin' | 'signup', idToken?: string, accessToken?: string) => Promise<void>;
  guestSignin: (userData: IUser) => void;
  generateMealPlan: (userData: IUser, language: string) => Promise<void>;
  updateMealInPlan: (userId: string, date: Date, meal: IMeal) => Promise<void>;
  updateFavorite: (userId: string, mealId: string, isFavorite: boolean) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  plan: null,
  loading: true,
  token: localStorage.getItem('token'),

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  fetchUser: async (token: string, onSuccess?: () => void) => {
    try {
      const { user, plan } = await userAPI.fetchUser(token);
      set({ user, plan });
      onSuccess?.();
    } catch (error) {
      console.error('Error fetching user:', error);
      get().logout();
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
      set({ user, plan, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, userData?: IUser) => {
    try {   
      set({ loading: true });
      const { user, plan, token } = await userAPI.signup(email, password, userData);
      get().setToken(token);
      set({ user, plan, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  oauthSignin: async (provider: string) => {
    try {
      set({ loading: true });
      
      // For Google OAuth
      if (provider === 'google') {
        // Initialize Google OAuth for sign-in
        const { token } = await userAPI.oauthSignin(provider, 'signin');
        get().setToken(token);
        const { user, plan } = await userAPI.fetchUser(token);
        set({ user, plan, loading: false });
        return;
      }
      
      // For Facebook OAuth
      if (provider === 'facebook') {
        // Initialize Facebook OAuth for sign-in
        const { token } = await userAPI.oauthSignin(provider, 'signin');
        get().setToken(token);
        const { user, plan } = await userAPI.fetchUser(token);
        set({ user, plan, loading: false });
        return;
      }
      
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  oauthSignup: async (provider: string) => {
    try {
      set({ loading: true });
      
      // For Google OAuth
      if (provider === 'google') {
        // Initialize Google OAuth for sign-up

        const { token } = await userAPI.oauthSignup(provider, 'signup');
        get().setToken(token);
        return;
      }
      
      // For Facebook OAuth
      if (provider === 'facebook') {
        // Initialize Facebook OAuth for sign-up

        const { token } = await userAPI.oauthSignup(provider, 'signup');
        get().setToken(token);

        return;
      }
      
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Handle OAuth callback with tokens
  handleOAuthCallback: async (provider: string, action: 'signin' | 'signup', idToken?: string, accessToken?: string) => {
    try {
      set({ loading: true });
      const { token, user } = action === 'signin' 
        ? await userAPI.oauthSignin(provider, idToken, accessToken)
        : await userAPI.oauthSignup(provider, idToken, accessToken);
      get().setToken(token);
      
      // Fetch plan if signing in
      if (action === 'signin') {
        const { plan } = await userAPI.fetchUser(token);
        set({ user, plan, loading: false });
      } else {
        set({ user, loading: false });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  guestSignin: (userData: IUser) => {
      set({ loading: true });
      set({ user: userData, loading: false });
  },

  updateProfile: async (data: Partial<IUser>) => {
    try {
      set({ loading: true });
      const token = get().token;
      if (!token) {
        throw new Error('No token found');
      }
      const updatedUser = await userAPI.updateUser(token, data as IUser);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    get().setToken(null);
    set({ user: null, loading: false });
  },

  generateMealPlan: async (userData: IUser, language: string) => {
    try {
      set({ loading: true });
      const { data } = await userAPI.generateMealPlan(userData, language);

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
        throw new Error('No token found');
      }
      const { data } = await userAPI.updateMealInPlan(userId, date, meal);
      console.log(data);
      set({ plan: data.plan, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateFavorite: async (userId: string, mealId: string, isFavorite: boolean) => {
    try {
      set({ loading: true });
      const { data } = await userAPI.updateFavorite(userId, mealId, isFavorite);
      set({ user: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));

// Initialize user on app start
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    useAuthStore.getState().fetchUser(token, () => {
      // Auto-navigate to dashboard if not already there
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
      }
    });
  } else {
    useAuthStore.getState().setLoading(false);
  }
}