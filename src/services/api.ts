import axios, { AxiosResponse } from "axios";
import {
  IUser,
  IPlan,
  IProgress,
  IMeal,
  IDailyProgress,
  WorkoutData,
} from "../types/interfaces";
import { IngredientInput } from "../lib/shoppingHelpers";
import config from "./config";

const API_URL = config.baseURL;

const userClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const mealGenerationClient = axios.create({
  baseURL: API_URL,
  timeout: config.mealGenerationTimeout,
});

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper function to get auth headers
const getAuthHeaders = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response: AxiosResponse<IUser[]> = await userClient.get<IUser[]>(
      "/users"
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.message || "Failed to fetch users. Please try again."
      );
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const getUserById = async (id: string): Promise<IUser> => {
  try {
    const response: AxiosResponse<IUser> = await userClient.get<IUser>(
      `/users/${id}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.message || "Failed to fetch user. Please try again."
      );
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const saveUser = async (user: IUser): Promise<IUser> => {
  try {
    const response: AxiosResponse<IUser> = await userClient.post<IUser>(
      "/users",
      user
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.message || "Failed to save user. Please try again."
      );
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const updateUser = async (id: string, user: IUser): Promise<IUser> => {
  try {
    const response: AxiosResponse<IUser> = await userClient.put<IUser>(
      `/users/${id}`,
      user,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.message || "Failed to update user. Please try again."
      );
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const deleteUser = async (id: string): Promise<void> => {
  try {
    await userClient.delete(`/users/${id}`, { headers: getAuthHeaders() });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.message || "Failed to delete user. Please try again."
      );
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const login = async (email: string, password: string): Promise<string> => {
  try {
    const response: AxiosResponse<{ data: { token: string }; status: string }> =
      await userClient.post("/login", { email, password });
    return response.data.data.token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message || "Failed to login. Please try again.");
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const signup = async (
  email: string,
  password: string,
  userData?: any
): Promise<{ token: string; user: IUser; plan: IPlan }> => {
  try {
    const response: AxiosResponse<{
      data: { user: IUser; plan: IPlan; token: string };
      status: string;
    }> = await userClient.post("/auth/signup", { email, password, userData });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message || "Failed to signup. Please try again.");
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const fetchUser = async (
  token: string
): Promise<{ user: IUser; plan: IPlan }> => {
  try {
    const response: AxiosResponse<{ data: { user: IUser; plan: IPlan } }> =
      await userClient.get("/auth/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to fetch user. Please try again.");
  }
};

const oauthAuth = async (
  provider: string,
  action: "signin" | "signup",
  userId?: string,
  accessToken?: string
): Promise<{ data: { token: string; user: IUser; plan?: IPlan } }> => {
  try {
    // For signup, use the unified /signup endpoint (same as regular signup)
    if (action === "signup") {
      const payload: any = {
        provider,
        userId,
        accessToken,
      };

      const response: AxiosResponse<{
        data: { user: IUser; plan?: IPlan; token: string };
      }> = await userClient.post("/auth/signup", payload);

      return {
        data: {
          token: response.data.data.token,
          user: response.data.data.user,
          plan: response.data.data.plan,
        },
      };
    }

    // For signin, use the OAuth signin endpoint
    const payload: any = { provider, userId, accessToken };

    const response: AxiosResponse<{
      data: { token: string; user: IUser; plan?: IPlan };
    }> = await userClient.post(`/auth/${provider}/signin`, payload);
    return {
      data: {
        token: response.data.data.token,
        user: response.data.data.user,
        plan: response.data.data.plan,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          `OAuth ${action} failed. Please try again.`
      );
    }
    throw new Error(`An unexpected error occurred during OAuth ${action}.`);
  }
};

const initiateOAuth = async (
  provider: string,
  action: "signin" | "signup" = "signin"
): Promise<string> => {
  try {
    // Construct the callback URLs
    // redirectUri: Backend callback URL where Google will redirect after authentication
    //   This should be your backend's OAuth callback endpoint
    // frontendRedirectUri: Frontend callback URL where backend will redirect after processing
    //   This is where the frontend receives the tokens
    const frontendBaseURL = window.location.origin;
    const frontendRedirectUri = `${frontendBaseURL}/auth/callback?provider=${provider}&action=${action}`;

    // Determine backend base URL
    // If API_URL is a relative path (/api), assume backend is on same origin
    // If API_URL is a full URL, use that as the base
    let backendBaseURL: string;
    if (API_URL.startsWith("http")) {
      // Full URL (e.g., "http://localhost:5000/api")
      backendBaseURL = API_URL.replace("/api", "");
    } else {
      // Relative path (e.g., "/api") - backend is on same origin
      backendBaseURL = frontendBaseURL;
    }
    const redirectUri = `${backendBaseURL}/auth/${provider}/callback`;

    // IMPORTANT: Backend must return JSON with { authUrl: string }, NOT a 302 redirect
    // If backend returns a redirect, axios will try to follow it and hit CORS errors

    // Build params object, only including prompt for Google
    const params: Record<string, string> = {
      redirectUri,
      frontendRedirectUri,
    };

    // Force Google to show account picker so user can choose which account to use
    if (provider === "google") {
      params.prompt = "select_account";
    }

    const response: AxiosResponse<{ authUrl: string }> = await userClient.get(
      `/auth/${provider}/${action}`,
      {
        params,
        // Prevent axios from following redirects (in case backend accidentally redirects)
        maxRedirects: 0,
        validateStatus: (status) => status === 200, // Only accept 200 OK
      }
    );

    if (!response.data?.authUrl) {
      throw new Error("Backend did not return authUrl in response");
    }

    return response.data.authUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // If we get a redirect error, the backend is redirecting instead of returning JSON
      if (
        error.response?.status === 302 ||
        error.message.includes("redirected")
      ) {
        throw new Error(
          "Backend is returning a redirect instead of JSON. Please update backend to return { authUrl: string } as JSON response."
        );
      }
      throw new Error(
        error.response?.data?.message ||
          "Failed to initiate OAuth. Please try again."
      );
    }
    throw new Error("An unexpected error occurred while initiating OAuth.");
  }
};

const getTodayProgress = async (
  userId: string
): Promise<{ progress: IDailyProgress; stats: any; message: string }> => {
  try {
    const response: AxiosResponse<{
      data: { progress: IDailyProgress; stats: any; message: string };
    }> = await userClient.get(`/progress/today/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to get today progress. Please try again.");
  }
};

const generateMealPlan = async (
  userData: IUser,
  planName: string,
  language: string
): Promise<{ data: any }> => {
  const payload = {
    startDate: new Date().toISOString(),
    language,
    planName: planName ?? "",
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> =
      await mealGenerationClient.post(
        `/generate/weekly-meal-plan/${userData._id}`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Meal plan generation is taking longer than expected. The plan may still be generating in the background. Please wait a moment and refresh the page."
        );
      }
      if (error.response?.status === 504 || error.code === "ETIMEDOUT") {
        throw new Error(
          "Server timeout - the meal plan is still being generated. Please wait a few minutes and refresh the page."
        );
      }
      throw new Error(
        error.response?.data?.message ||
          "Failed to generate meal plan. Please try again."
      );
    }
    throw new Error("Failed to generate meal plan. Please try again.");
  }
};

const updateProgress = async (
  userId: string,
  progress: IDailyProgress
): Promise<{ data: any }> => {
  const payload = {
    progress,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/progress/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update progress. Please try again.");
  }
};

const updateMealPlan = async (
  userId: string,
  mealPlan: IPlan
): Promise<{ data: any }> => {
  const payload = {
    mealPlan,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/plan/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update meal plan. Please try again.");
  }
};

const updateMealInPlan = async (
  userId: string,
  date: Date,
  meal: IMeal
): Promise<{ data: any }> => {
  const stringDate = new Date(date).toISOString();
  const payload = {
    date: stringDate,
    meal,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/plan/${userId}/update-meal`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update meal. Please try again.");
  }
};

const addWaterGlass = async (
  userId: string,
  date: string,
  glasses: number
): Promise<{ data: any }> => {
  const payload = {
    glasses,
    date,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.post(
      `/progress/water/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to add water glass. Please try again.");
  }
};

const addWorkout = async (
  userId: string,
  workout: WorkoutData
): Promise<{ data: any }> => {
  const payload = { ...workout, useMock: config.useMock };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.post(
      `/plan/${userId}/workout`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to add workout. Please try again.");
  }
};

const updateWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<{ data: any }> => {
  const dailyDate = new Date(date);
  dailyDate.setHours(0, 0, 0, 0);
  const payload = {
    date: dailyDate.toISOString(),
    workout,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/plan/${userId}/workout`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update workout. Please try again.");
  }
};

const deleteWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<{ data: any }> => {
  const dailyDate = new Date(date);
  dailyDate.setHours(0, 0, 0, 0);
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.delete(
      `/plan/${userId}/workout/${date}/${workout.name}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete workout. Please try again.");
  }
};

const completeWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<{ data: any }> => {
  const dailyDate = new Date(date);
  dailyDate.setHours(0, 0, 0, 0);
  const payload = {
    date: dailyDate.toISOString(),
    workout,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/progress/workout-completed/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to complete workout. Please try again.");
  }
};

const updateFavorite = async (
  userId: string,
  mealId: string,
  isFavorite: boolean
): Promise<{ data: any }> => {
  const payload = {
    mealId,
    isFavorite,
    useMock: config.useMock,
  };
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/users/${userId}/favorite-meals`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      throw new Error("AUTH_ERROR");
    }
    throw new Error("Failed to update favorite. Please try again.");
  }
};

const getFavoritesByUserId = async (userId: string): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.get(
      `/users/${userId}/favorite-meals`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to get favorites. Please try again.");
  }
};

// Shopping Bag API
const getShoppingList = async (
  userId: string,
  planId: string
): Promise<{ ingredients: IngredientInput[] }> => {
  try {
    const response: AxiosResponse<{
      data: { ingredients: IngredientInput[] };
    }> = await userClient.get(
      `/meals/${userId}/shopping-list?planId=${planId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to get shopping list. Please try again.");
  }
};

const updateShoppingItem = async (
  userId: string,
  itemId: string,
  checked: boolean
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/shopping/${userId}/item/${itemId}`,
      { checked },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update shopping item. Please try again.");
  }
};

const clearShoppingList = async (userId: string): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.delete(
      `/shopping/${userId}/clear`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to clear shopping list. Please try again.");
  }
};

// Favorite Recipes API
const getFavoriteRecipes = async (userId: string): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.get(
      `/recipes/favorites/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to get favorite recipes. Please try again.");
  }
};

const toggleFavoriteRecipe = async (
  userId: string,
  recipeId: string,
  isFavorite: boolean
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/recipes/favorites/${userId}`,
      { recipeId, isFavorite },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update favorite recipe. Please try again.");
  }
};

// Goals API
const getGoals = async (userId: string): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.get(
      `/goals/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to get goals. Please try again.");
  }
};

const createGoal = async (
  userId: string,
  goal: any
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.post(
      `/goals/${userId}`,
      goal,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to create goal. Please try again.");
  }
};

const updateGoal = async (
  userId: string,
  goalId: string,
  updates: any
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/goals/${userId}/${goalId}`,
      updates,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update goal. Please try again.");
  }
};

const deleteGoal = async (
  userId: string,
  goalId: string
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.delete(
      `/goals/${userId}/${goalId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete goal. Please try again.");
  }
};

const updateGoalProgress = async (
  userId: string,
  goalId: string,
  current: number
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/goals/${userId}/${goalId}/progress`,
      { current },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update goal progress. Please try again.");
  }
};

// Progress/Daily Tracker API
const getProgressHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: any }> => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response: AxiosResponse<{ data: any }> = await userClient.get(
      `/progress/${userId}/history`,
      { params, headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to get progress history. Please try again.");
  }
};

const updateDailyProgress = async (
  userId: string,
  date: string,
  progress: Partial<IDailyProgress>
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/progress/${userId}/daily`,
      { date, progress },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update daily progress. Please try again.");
  }
};

const completeMeal = async (
  userId: string,
  date: string,
  mealType: string,
  mealId: string
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/progress/meal/${userId}/${mealId}`,
      { date, mealType, mealId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to complete meal. Please try again.");
  }
};

// Meal criteria interface for AI suggestions
export interface MealCriteria {
  category: "breakfast" | "lunch" | "dinner" | "snack";
  targetCalories: number;
  dietaryRestrictions: string[];
  preferences: string[];
  dislikes: string[];
}

// AI Meal Suggestions
const getAIMealSuggestions = async (
  userId: string,
  mealCriteria: MealCriteria,
  aiRules?: string
): Promise<{ data: { meals: IMeal[] } }> => {
  try {
    const response: AxiosResponse<{ data: { meals: IMeal[] } }> =
      await mealGenerationClient.post(
        `/generate/meal-suggestions/${userId}`,
        { mealCriteria, aiRules },
        { headers: getAuthHeaders() }
      );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to get AI suggestions. Please try again."
      );
    }
    throw new Error("Failed to get AI suggestions. Please try again.");
  }
};

// Change meal in plan (for weekly/daily view)
const changeMealInPlan = async (
  userId: string,
  planId: string,
  date: string,
  mealType: string,
  newMeal: IMeal,
  snackIndex?: number // Index of snack to change (only for mealType "snacks")
): Promise<{ data: any }> => {
  try {
    const response: AxiosResponse<{ data: any }> = await userClient.put(
      `/plan/${userId}/meal-replace/${planId}`,
      {
        date,
        mealType,
        newMeal,
        ...(snackIndex !== undefined && { snackIndex }),
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to change meal. Please try again.");
  }
};

export const userAPI = {
  getAllUsers,
  getUserById,
  saveUser,
  updateUser,
  deleteUser,
  login,
  signup,
  fetchUser,
  oauthAuth,
  initiateOAuth,
  getTodayProgress,
  generateMealPlan,
  updateProgress,
  updateMealPlan,
  updateMealInPlan,
  addWaterGlass,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  updateFavorite,
  getFavoritesByUserId,
  // Shopping Bag
  getShoppingList,
  updateShoppingItem,
  clearShoppingList,
  // Favorite Recipes
  getFavoriteRecipes,
  toggleFavoriteRecipe,
  // Goals
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  // Progress/Daily Tracker
  getProgressHistory,
  updateDailyProgress,
  completeMeal,
  // Meal Changes
  getAIMealSuggestions,
  changeMealInPlan,
};
