import axios, { AxiosResponse } from "axios";
import {
  IUser,
  IPlan,
  IMeal,
  IDailyProgress,
  WorkoutData,
  IRecipe,
  IGoal,
  IAnalyticsData,
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
const getAuthHeaders = ():
  | { Authorization: string }
  | Record<string, never> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Wrapper function for API calls with consistent error handling
 * @param fn - Async function that makes the API call
 * @param errorMessage - Default error message if no specific error is available
 * @returns The result of the API call
 */
const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Check for specific error message from server
      const serverMessage = error.response?.data?.message;
      throw new Error(serverMessage || error.message || errorMessage);
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

const getAllUsers = async (): Promise<IUser[]> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<IUser[]>("/users");
    return response.data;
  }, "Failed to fetch users. Please try again.");
};

const getUserById = async (id: string): Promise<IUser> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<IUser>(`/users/${id}`);
    return response.data;
  }, "Failed to fetch user. Please try again.");
};

const saveUser = async (user: IUser): Promise<IUser> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<IUser>("/users", user);
    return response.data;
  }, "Failed to save user. Please try again.");
};

const updateUser = async (id: string, user: IUser): Promise<IUser> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<IUser>(`/users/${id}`, user, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }, "Failed to update user. Please try again.");
};

const deleteUser = async (id: string): Promise<void> => {
  return withErrorHandling(async () => {
    await userClient.delete(`/users/${id}`, { headers: getAuthHeaders() });
  }, "Failed to delete user. Please try again.");
};

const login = async (email: string, password: string): Promise<string> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<{
      data: { token: string };
      status: string;
    }>("/login", { email, password });
    return response.data.data.token;
  }, "Failed to login. Please try again.");
};

const signup = async (
  email: string,
  password: string,
  userData?: Partial<IUser>
): Promise<{ token: string; user: IUser; plan: IPlan }> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<{
      data: { user: IUser; plan: IPlan; token: string };
      status: string;
    }>("/auth/signup", { email, password, userData });
    return response.data.data;
  }, "Failed to signup. Please try again.");
};

const fetchUser = async (
  token: string
): Promise<{ user: IUser; plan: IPlan }> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<{
      data: { user: IUser; plan: IPlan };
    }>("/auth/users/me", { headers: { Authorization: `Bearer ${token}` } });
    return response.data.data;
  }, "Failed to fetch user. Please try again.");
};

const oauthAuth = async (
  provider: string,
  action: "signin" | "signup",
  userId?: string,
  accessToken?: string
): Promise<{ data: { token: string; user: IUser; plan?: IPlan } }> => {
  try {
    // Both signin and signup use the same endpoint after OAuth callback
    // The user is already created by the OAuth callback flow
    // We just need to fetch the user data using the userId and token
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

    // Build the backend callback URL
    // API_URL = "https://habeat-server.vercel.app/api"
    // Auth callback should be at: /api/auth/google/callback
    const redirectUri = `${API_URL}/auth/${provider}/callback`;

    // Debug logging
    console.log("[OAuth Debug] API_URL:", API_URL);
    console.log("[OAuth Debug] redirectUri (backend callback):", redirectUri);
    console.log("[OAuth Debug] frontendRedirectUri:", frontendRedirectUri);
    console.log(
      "[OAuth Debug] Make sure this EXACT URL is in Google Cloud Console:",
      redirectUri
    );

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

interface ProgressStats {
  calories: { consumed: number; goal: number; percentage: number };
  water: { consumed: number; goal: number; percentage: number };
  macros: {
    protein: { consumed: number; goal: number; percentage: number };
    carbs: { consumed: number; goal: number; percentage: number };
    fat: { consumed: number; goal: number; percentage: number };
  };
}

const getTodayProgress = async (
  userId: string
): Promise<{
  progress: IDailyProgress;
  stats: ProgressStats;
  message: string;
}> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<{
      data: { progress: IDailyProgress; stats: ProgressStats; message: string };
    }>(`/progress/today/${userId}`, { headers: getAuthHeaders() });
    return response.data.data;
  }, "Failed to get today progress. Please try again.");
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

// Generic API response type for endpoints returning { data: T }
interface ApiResponse<T> {
  data: T;
}

const updateProgress = async (
  userId: string,
  progress: IDailyProgress
): Promise<ApiResponse<IDailyProgress>> => {
  return withErrorHandling(async () => {
    const payload = { progress, useMock: config.useMock };
    const response = await userClient.put<ApiResponse<IDailyProgress>>(
      `/progress/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update progress. Please try again.");
};

const updateMealPlan = async (
  userId: string,
  mealPlan: IPlan
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const payload = { mealPlan, useMock: config.useMock };
    const response = await userClient.put<ApiResponse<{ plan: IPlan }>>(
      `/plan/${userId}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update meal plan. Please try again.");
};

const updateMealInPlan = async (
  userId: string,
  date: Date,
  meal: IMeal
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const stringDate = new Date(date).toISOString();
    const payload = { date: stringDate, meal, useMock: config.useMock };
    const response = await userClient.put<ApiResponse<{ plan: IPlan }>>(
      `/plan/${userId}/update-meal`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update meal. Please try again.");
};

const addWaterGlass = async (
  userId: string,
  date: string,
  glasses: number
): Promise<ApiResponse<{ progress: IDailyProgress }>> => {
  return withErrorHandling(async () => {
    const payload = { glasses, date, useMock: config.useMock };
    const response = await userClient.post<
      ApiResponse<{ progress: IDailyProgress }>
    >(`/progress/water/${userId}`, payload, { headers: getAuthHeaders() });
    return response.data;
  }, "Failed to add water glass. Please try again.");
};

const addWorkout = async (
  userId: string,
  workout: WorkoutData
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const payload = { ...workout, useMock: config.useMock };
    const response = await userClient.post<ApiResponse<{ plan: IPlan }>>(
      `/plan/${userId}/workout`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to add workout. Please try again.");
};

const updateWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    const payload = {
      date: dailyDate.toISOString(),
      workout,
      useMock: config.useMock,
    };
    const response = await userClient.put<ApiResponse<{ plan: IPlan }>>(
      `/plan/${userId}/workout`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update workout. Please try again.");
};

const deleteWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.delete<ApiResponse<{ plan: IPlan }>>(
      `/plan/${userId}/workout/${date}/${workout.name}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to delete workout. Please try again.");
};

const completeWorkout = async (
  userId: string,
  date: string,
  workout: WorkoutData
): Promise<ApiResponse<{ progress: IDailyProgress }>> => {
  return withErrorHandling(async () => {
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    const payload = { date: dailyDate.toISOString(), workout };
    const response = await userClient.put<
      ApiResponse<{ progress: IDailyProgress }>
    >(`/progress/workout-completed/${userId}`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }, "Failed to complete workout. Please try again.");
};

const updateFavorite = async (
  userId: string,
  mealId: string,
  isFavorite: boolean
): Promise<ApiResponse<IUser>> => {
  try {
    const payload = { mealId, isFavorite, useMock: config.useMock };
    const response = await userClient.put<ApiResponse<IUser>>(
      `/users/${userId}/favorite-meals`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
      throw new Error("AUTH_ERROR");
    }
    throw new Error("Failed to update favorite. Please try again.");
  }
};

const getFavoritesByUserId = async (
  userId: string
): Promise<ApiResponse<IMeal[]>> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<ApiResponse<IMeal[]>>(
      `/users/${userId}/favorite-meals`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get favorites. Please try again.");
};

// Shopping Bag API
const getShoppingList = async (
  planId: string
): Promise<{ ingredients: IngredientInput[] }> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<{
      data: { ingredients: IngredientInput[] };
    }>(`/shopping/list?planId=${planId}`, { headers: getAuthHeaders() });
    return response.data.data;
  }, "Failed to get shopping list. Please try again.");
};

const updateShoppingItem = async (
  planId: string,
  item: IngredientInput
): Promise<ApiResponse<IngredientInput>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<IngredientInput>>(
      `/shopping/${planId}/items`,
      { item },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update shopping item. Please try again.");
};

const addShoppingItem = async (
  planId: string,
  item: IngredientInput
): Promise<ApiResponse<IngredientInput[]>> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<ApiResponse<IngredientInput[]>>(
      `/shopping/${planId}/items`,
      { items: [item] },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to add shopping item. Please try again.");
};

const deleteShoppingItem = async (
  planId: string,
  itemId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.delete<ApiResponse<{ success: boolean }>>(
      `/shopping/${planId}/items/${itemId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to delete shopping item. Please try again.");
};

const clearShoppingList = async (
  userId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.delete<ApiResponse<{ success: boolean }>>(
      `/shopping/${userId}/clear`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to clear shopping list. Please try again.");
};

// Favorite Recipes API
const getFavoriteRecipes = async (
  userId: string
): Promise<ApiResponse<{ recipes: IRecipe[] }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<ApiResponse<{ recipes: IRecipe[] }>>(
      `/recipes/favorites/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get favorite recipes. Please try again.");
};

const toggleFavoriteRecipe = async (
  userId: string,
  recipeId: string,
  isFavorite: boolean
): Promise<ApiResponse<{ success: boolean }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<{ success: boolean }>>(
      `/recipes/favorites/${userId}`,
      { recipeId, isFavorite },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update favorite recipe. Please try again.");
};

// Get Recipe by Meal ID (fetches full recipe details including instructions)
// First time: AI generates the recipe (takes time)
// Subsequent times: Returns from DB (instant)
const getRecipeByMealId = async (
  mealId: string,
  userId: string
): Promise<ApiResponse<IRecipe>> => {
  return withErrorHandling(async () => {
    const response = await mealGenerationClient.get<ApiResponse<IRecipe>>(
      `/recipes/${userId}/meal/${mealId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get recipe. Please try again.");
};

// Goals API

// GET :userId - Get all goals for user
const getGoals = async (userId: string): Promise<ApiResponse<IGoal[]>> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<ApiResponse<IGoal[]>>(
      `/goals/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get goals. Please try again.");
};

// GET :userId/goal/:id - Get goal by ID
const getGoalById = async (
  userId: string,
  goalId: string
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<ApiResponse<IGoal>>(
      `/goals/${userId}/goal/${goalId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get goal. Please try again.");
};

// POST - Create a new goal (userId from auth token)
const createGoal = async (
  goal: Omit<IGoal, "_id" | "userId">
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<ApiResponse<IGoal>>(`/goals`, goal, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }, "Failed to create goal. Please try again.");
};

// PUT :id - Update a goal
const updateGoal = async (
  goalId: string,
  updates: Partial<IGoal>
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<IGoal>>(
      `/goals/${goalId}`,
      updates,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update goal. Please try again.");
};

// DELETE :id - Delete a goal
const deleteGoal = async (
  goalId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.delete<ApiResponse<{ success: boolean }>>(
      `/goals/${goalId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to delete goal. Please try again.");
};

// POST generate - Generate a goal using AI
interface GenerateGoalDto {
  userId: string;
  title: string;
  description: string;
  startDate: string;
  targetDate?: string;
  language?: string;
}

const generateGoal = async (
  userId: string,
  data: GenerateGoalDto
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await mealGenerationClient.post<ApiResponse<IGoal>>(
      `/goals/${userId}/generate`,
      { ...data, language: data.language || "en" },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to generate goal. Please try again.");
};

// POST :id/progress - Add a progress entry to a goal
const addGoalProgress = async (
  goalId: string,
  value: number,
  date?: string
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<ApiResponse<IGoal>>(
      `/goals/${goalId}/progress`,
      { value, date },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to add progress entry. Please try again.");
};

// PUT :id/milestones/:milestoneId - Update a milestone
const updateMilestone = async (
  goalId: string,
  milestoneId: string,
  completed: boolean
): Promise<ApiResponse<IGoal>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<IGoal>>(
      `/goals/${goalId}/milestones/${milestoneId}`,
      { completed },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update milestone. Please try again.");
};

const getAnalytics = async (
  userId: string,
  period: "week" | "month" = "week"
): Promise<ApiResponse<IAnalyticsData>> => {
  return withErrorHandling(async () => {
    const response = await userClient.get<ApiResponse<IAnalyticsData>>(
      `/progress/analytics/${userId}`,
      { params: { period }, headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get analytics. Please try again.");
};

// Progress/Daily Tracker API
const getProgressHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{ history: IDailyProgress[] }>> => {
  return withErrorHandling(async () => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await userClient.get<
      ApiResponse<{ history: IDailyProgress[] }>
    >(`/progress/${userId}/history`, { params, headers: getAuthHeaders() });
    return response.data;
  }, "Failed to get progress history. Please try again.");
};

const updateDailyProgress = async (
  userId: string,
  date: string,
  progress: Partial<IDailyProgress>
): Promise<ApiResponse<IDailyProgress>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<IDailyProgress>>(
      `/progress/${userId}/daily`,
      { date, progress },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to update daily progress. Please try again.");
};

const completeMeal = async (
  userId: string,
  date: string,
  mealType: string,
  mealId: string
): Promise<ApiResponse<IDailyProgress>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<IDailyProgress>>(
      `/progress/meal/${userId}/${mealId}`,
      { date, mealType, mealId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to complete meal. Please try again.");
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
): Promise<ApiResponse<{ meals: IMeal[] }>> => {
  return withErrorHandling(async () => {
    const response = await mealGenerationClient.post<
      ApiResponse<{ meals: IMeal[] }>
    >(
      `/generate/meal-suggestions/${userId}`,
      { mealCriteria, aiRules },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to get AI suggestions. Please try again.");
};

// Change meal in plan (for weekly/daily view)
const changeMealInPlan = async (
  userId: string,
  planId: string,
  date: string,
  mealType: string,
  newMeal: IMeal,
  snackIndex?: number
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.put<ApiResponse<{ plan: IPlan }>>(
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
  }, "Failed to change meal. Please try again.");
};

// Add snack to plan
const addSnack = async (
  planId: string,
  date: string,
  name: string
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.post<ApiResponse<{ plan: IPlan }>>(
      `/plan/${planId}/add-snack`,
      { date, name },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to add snack. Please try again.");
};

// Delete snack from plan
const deleteSnack = async (
  planId: string,
  date: string,
  snackId: string
): Promise<ApiResponse<{ plan: IPlan }>> => {
  return withErrorHandling(async () => {
    const response = await userClient.delete<ApiResponse<{ plan: IPlan }>>(
      `/plan/${planId}/snack/${date}/${snackId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }, "Failed to delete snack. Please try again.");
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
  addShoppingItem,
  deleteShoppingItem,
  clearShoppingList,
  // Favorite Recipes
  getFavoriteRecipes,
  toggleFavoriteRecipe,
  getRecipeByMealId,
  // Goals
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  generateGoal,
  addGoalProgress,
  updateMilestone,
  // Analytics
  getAnalytics,
  // Progress/Daily Tracker
  getProgressHistory,
  updateDailyProgress,
  completeMeal,
  // Meal Changes
  getAIMealSuggestions,
  changeMealInPlan,
  addSnack,
  deleteSnack,
};
