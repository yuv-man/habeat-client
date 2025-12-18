import React, { useState, useEffect } from "react";
import { Search, ShoppingBag as ShoppingBagIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IngredientInput } from "@/lib/shoppingHelpers";
import BottomNav from "@/components/ui/BottomNav";
import NavBar from "@/components/ui/navbar";
import MobileHeader from "@/components/ui/MobileHeader";
import { userAPI } from "@/services/api";
import { mockShoppingIngredients } from "@/mocks/shoppingListMock";
import config from "@/services/config";
import ShoppingBag from "@/components/shopping/ShoppingBag";

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user, plan, loading, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if not loading, no user, AND no token
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);

  useEffect(() => {
    const fetchShoppingList = async () => {
      if (config.testFrontend || !plan) {
        // Use mock data in test mode or if no plan
        setIngredients(mockShoppingIngredients as IngredientInput[]);
        setIsLoading(false);
      } else if (plan && user?._id && plan._id) {
        try {
          const ingredients = await getShoppingList(user._id, plan._id);
          setIngredients(ingredients as IngredientInput[]);
        } catch (error) {
          console.error("Failed to fetch shopping list:", error);
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
    const response = await userAPI.getShoppingList(userId, planId);
    return response.ingredients as IngredientInput[];
  };

  const toggleItem = (itemName: string) => {
    // This will be handled by ShoppingBag component's internal state
    // or we can manage it here if needed
    console.log("Toggle item:", itemName);
  };

  // Filter ingredients by search query
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
    <div className="min-h-screen bg-white pb-20 md:pb-0 pt-14 md:pt-16">
      <MobileHeader />
      <NavBar />
      <div className="px-4 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Shopping List</h1>

        {/* Search Bar */}
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

        {/* Shopping Categories */}
        <ShoppingBag
          ingredients={filteredIngredients}
          onItemToggle={toggleItem}
        />

        {/* Floating Action Button */}
        <button className="fixed bottom-24 right-6 md:bottom-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40">
          <ShoppingBagIcon className="w-6 h-6" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingList;
