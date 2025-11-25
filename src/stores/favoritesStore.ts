import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IRecipe } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import config from "@/services/config";

interface FavoritesState {
  favoriteRecipes: IRecipe[];
  favoriteMealIds: string[];
  loading: boolean;
  error: string | null;
}

interface FavoritesActions {
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavoriteRecipe: (userId: string, recipeId: string) => Promise<void>;
  toggleFavoriteMeal: (userId: string, mealId: string) => Promise<void>;
  isRecipeFavorite: (recipeId: string) => boolean;
  isMealFavorite: (mealId: string) => boolean;
  setFavoriteRecipes: (recipes: IRecipe[]) => void;
  setFavoriteMealIds: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type FavoritesStore = FavoritesState & FavoritesActions;

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      // State
      favoriteRecipes: [],
      favoriteMealIds: [],
      loading: false,
      error: null,

      // Actions
      setFavoriteRecipes: (recipes) => set({ favoriteRecipes: recipes }),
      setFavoriteMealIds: (ids) => set({ favoriteMealIds: ids }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchFavorites: async (userId: string) => {
        if (config.testFrontend) {
          // Use mock data in test mode
          return;
        }

        try {
          set({ loading: true, error: null });
          const [recipesResponse, mealsResponse] = await Promise.all([
            userAPI.getFavoriteRecipes(userId),
            userAPI.getFavoritesByUserId(userId),
          ]);

          set({
            favoriteRecipes: recipesResponse.data.recipes || [],
            favoriteMealIds: mealsResponse.data.mealIds || [],
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch favorites",
            loading: false,
          });
        }
      },

      toggleFavoriteRecipe: async (userId: string, recipeId: string) => {
        const { favoriteRecipes, isRecipeFavorite } = get();
        const isFavorite = isRecipeFavorite(recipeId);

        if (config.testFrontend) {
          // Update local state in test mode
          if (isFavorite) {
            set({
              favoriteRecipes: favoriteRecipes.filter(
                (recipe) => recipe.id !== recipeId
              ),
            });
          } else {
            // In real app, you'd fetch the recipe details
            // For now, just add the ID
            set({ favoriteRecipes });
          }
          return;
        }

        try {
          await userAPI.toggleFavoriteRecipe(userId, recipeId, !isFavorite);

          if (isFavorite) {
            set({
              favoriteRecipes: favoriteRecipes.filter(
                (recipe) => recipe.id !== recipeId
              ),
            });
          } else {
            // Recipe will be added by backend, refresh list
            await get().fetchFavorites(userId);
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to update favorite recipe" });
        }
      },

      toggleFavoriteMeal: async (userId: string, mealId: string) => {
        const { favoriteMealIds, isMealFavorite } = get();
        const isFavorite = isMealFavorite(mealId);

        if (config.testFrontend) {
          // Update local state in test mode
          if (isFavorite) {
            set({
              favoriteMealIds: favoriteMealIds.filter((id) => id !== mealId),
            });
          } else {
            set({
              favoriteMealIds: [...favoriteMealIds, mealId],
            });
          }
          return;
        }

        try {
          await userAPI.updateFavorite(userId, mealId, !isFavorite);

          if (isFavorite) {
            set({
              favoriteMealIds: favoriteMealIds.filter((id) => id !== mealId),
            });
          } else {
            set({
              favoriteMealIds: [...favoriteMealIds, mealId],
            });
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to update favorite meal" });
        }
      },

      isRecipeFavorite: (recipeId: string) => {
        return get().favoriteRecipes.some((recipe) => recipe.id === recipeId);
      },

      isMealFavorite: (mealId: string) => {
        return get().favoriteMealIds.includes(mealId);
      },
    }),
    {
      name: "favorites-storage",
      partialize: (state) => ({
        favoriteRecipes: state.favoriteRecipes,
        favoriteMealIds: state.favoriteMealIds,
      }),
    }
  )
);
