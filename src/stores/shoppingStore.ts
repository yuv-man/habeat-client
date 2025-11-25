import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IngredientInput } from "@/lib/shoppingHelpers";
import { ShoppingItem, ShoppingCategory } from "@/mocks/shoppingListMock";
import { userAPI } from "@/services/api";
import config from "@/services/config";

interface ShoppingState {
  ingredients: IngredientInput[];
  categorizedItems: ShoppingCategory[];
  loading: boolean;
  error: string | null;
}

interface ShoppingActions {
  fetchShoppingList: (userId: string) => Promise<void>;
  toggleItem: (
    userId: string,
    categoryIndex: number,
    itemId: string
  ) => Promise<void>;
  clearList: (userId: string) => Promise<void>;
  setIngredients: (ingredients: IngredientInput[]) => void;
  setCategorizedItems: (items: ShoppingCategory[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ShoppingStore = ShoppingState & ShoppingActions;

export const useShoppingStore = create<ShoppingStore>()(
  persist(
    (set, get) => ({
      // State
      ingredients: [],
      categorizedItems: [],
      loading: false,
      error: null,

      // Actions
      setIngredients: (ingredients) => set({ ingredients }),
      setCategorizedItems: (items) => set({ categorizedItems: items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchShoppingList: async (userId: string) => {
        if (config.testFrontend) {
          // Use mock data in test mode
          return;
        }

        try {
          set({ loading: true, error: null });
          const response = await userAPI.getShoppingList(userId);
          const ingredients: IngredientInput[] =
            response.data.ingredients || [];
          set({ ingredients, loading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch shopping list",
            loading: false,
          });
        }
      },

      toggleItem: async (
        userId: string,
        categoryIndex: number,
        itemId: string
      ) => {
        if (config.testFrontend) {
          // Update local state in test mode
          const { categorizedItems } = get();
          const newItems = [...categorizedItems];
          const item = newItems[categoryIndex]?.items.find(
            (item) => item.id === itemId
          );
          if (item) {
            item.checked = !item.checked;
            set({ categorizedItems: newItems });
          }
          return;
        }

        try {
          const { categorizedItems } = get();
          const item = categorizedItems[categoryIndex]?.items.find(
            (item) => item.id === itemId
          );
          if (!item) return;

          const newChecked = !item.checked;
          await userAPI.updateShoppingItem(userId, itemId, newChecked);

          // Update local state
          const newItems = [...categorizedItems];
          item.checked = newChecked;
          set({ categorizedItems: newItems });
        } catch (error: any) {
          set({ error: error.message || "Failed to update shopping item" });
        }
      },

      clearList: async (userId: string) => {
        if (config.testFrontend) {
          set({ ingredients: [], categorizedItems: [] });
          return;
        }

        try {
          await userAPI.clearShoppingList(userId);
          set({ ingredients: [], categorizedItems: [] });
        } catch (error: any) {
          set({ error: error.message || "Failed to clear shopping list" });
        }
      },
    }),
    {
      name: "shopping-storage",
      partialize: (state) => ({
        ingredients: state.ingredients,
        categorizedItems: state.categorizedItems,
      }),
    }
  )
);
