import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IngredientInput } from "@/lib/shoppingHelpers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { userAPI } from "@/services/api";
import { mockShoppingIngredients } from "@/mocks/shoppingListMock";
import config from "@/services/config";
import ShoppingBag from "@/components/shopping/ShoppingBag";
import AddItemModal from "@/components/shopping/AddItemModal";

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user, plan, loading, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasFetched.current) return;

    const fetchShoppingList = async () => {
      if (config.testFrontend || !plan) {
        setIngredients(mockShoppingIngredients as IngredientInput[]);
        setIsLoading(false);
        hasFetched.current = true;
      } else if (plan && user?._id && plan._id) {
        try {
          hasFetched.current = true;
          const ingredients = await getShoppingList(user._id, plan._id);
          setIngredients(ingredients as IngredientInput[]);
        } catch (error) {
          console.error("Failed to fetch shopping list:", error);
          hasFetched.current = false; // Allow retry on error
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchShoppingList();
  }, [plan, user?._id]);

  const getShoppingList = async (
    userId: string,
    planId: string
  ): Promise<IngredientInput[]> => {
    const response = await userAPI.getShoppingList(planId);
    return response.ingredients as IngredientInput[];
  };

  const toggleItem = (item: IngredientInput) => {
    userAPI.updateShoppingItem(plan?._id, item);
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.name === item.name ? { ...ing, done: !ing.done } : ing
      )
    );
  };

  const deleteItem = (itemName: string) => {
    setIngredients((prev) => prev.filter((item) => item.name !== itemName));
    userAPI.deleteShoppingItem(plan._id, itemName);
  };

  // Get unique categories from ingredients, sorted with "Other" at the end
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      ingredients.map((ing) => ing.category).filter(Boolean)
    );
    const sortedCategories = Array.from(uniqueCategories).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
    // Always include "Other" as last option if not present
    if (!sortedCategories.includes("Other")) {
      sortedCategories.push("Other");
    }
    return sortedCategories;
  }, [ingredients]);

  const handleAddItem = (newIngredient: IngredientInput) => {
    setIngredients((prev) => [...prev, newIngredient]);
    setShowAddModal(false);
    userAPI.addShoppingItem(plan._id, newIngredient);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout bgColor="bg-white" showNavBar={true}>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Shopping List</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
          </div>
        </div>

        <ShoppingBag
          ingredients={filteredIngredients}
          onItemToggle={toggleItem}
          onItemDelete={deleteItem}
        />

        {/* Add Item Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 right-6 md:bottom-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Add Item Modal */}
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  );
};

export default ShoppingList;
