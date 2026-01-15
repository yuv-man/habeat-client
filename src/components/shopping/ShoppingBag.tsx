import React, { useState, useEffect, useMemo } from "react";
import { Check, Trash2 } from "lucide-react";
import { IngredientInput } from "@/lib/shoppingHelpers";
import { getCategoryIcon } from "@/lib/shoppingCategoryIcons";

interface ShoppingBagProps {
  ingredients: IngredientInput[];
  onItemToggle?: (item: IngredientInput) => void;
  onItemDelete?: (itemName: string) => void;
}

const ShoppingBag = ({
  ingredients,
  onItemToggle,
  onItemDelete,
}: ShoppingBagProps) => {
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

  const handleToggle = (item: IngredientInput) => {
    setItems((prev) =>
      prev.map((ing) =>
        ing.name === item.name ? { ...ing, done: !ing.done } : ing
      )
    );
    onItemToggle?.({ ...item, done: !item.done });
  };

  const handleDelete = (itemName: string) => {
    setItems((prev) => prev.filter((item) => item.name !== itemName));
    onItemDelete?.(itemName);
  };

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const { icon: CategoryIcon, color } = getCategoryIcon(category);
        return (
          <div
            key={category}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <h2
              className={`font-bold text-lg mb-4 ${color} flex items-center gap-2`}
            >
              <CategoryIcon className="w-5 h-5" />
              {category}
            </h2>
          <div className="space-y-0">
            {groupedByCategory[category].map((item, itemIndex) => (
              <div key={item.name}>
                <div className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => handleToggle(item)}
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
                  <span className="text-sm text-gray-600 mr-2">
                    {item.amount}
                  </span>
                  <button
                    onClick={() => handleDelete(item.name)}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {itemIndex < groupedByCategory[category].length - 1 && (
                  <div className="border-b border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default ShoppingBag;
