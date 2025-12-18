import React, { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { IngredientInput } from "@/lib/shoppingHelpers";

interface ShoppingBagProps {
  ingredients: IngredientInput[];
  onItemToggle?: (itemName: string) => void;
}

// Generate a consistent color for a category based on its name
const getCategoryColor = (category: string): string => {
  const colors = [
    "text-green-600",
    "text-red-500",
    "text-amber-600",
    "text-orange-500",
    "text-blue-500",
    "text-purple-500",
    "text-pink-500",
    "text-teal-500",
    "text-indigo-500",
    "text-cyan-500",
  ];

  // Simple hash function to get consistent color per category
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const ShoppingBag = ({ ingredients, onItemToggle }: ShoppingBagProps) => {
  const [items, setItems] = useState<IngredientInput[]>([]);

  useEffect(() => {
    setItems(ingredients);
  }, [ingredients]);

  // Group ingredients by their actual category
  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, IngredientInput[]> = {};

    for (const item of items) {
      const category = item.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }

    return grouped;
  }, [items]);

  // Get categories sorted alphabetically (with "Other" at the end)
  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedByCategory);

    return categories.sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
  }, [groupedByCategory]);

  const handleToggle = (itemName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.name === itemName ? { ...item, done: !item.done } : item
      )
    );
    onItemToggle?.(itemName);
  };

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div
          key={category}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <h2
            className={`font-bold text-lg mb-4 ${getCategoryColor(category)}`}
          >
            {category}
          </h2>
          <div className="space-y-0">
            {groupedByCategory[category].map((item, itemIndex) => (
              <div key={item.name}>
                <div className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => handleToggle(item.name)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      item.done
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {item.done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.done ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {item.name.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-gray-600">{item.amount}</span>
                </div>
                {itemIndex < groupedByCategory[category].length - 1 && (
                  <div className="border-b border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShoppingBag;
