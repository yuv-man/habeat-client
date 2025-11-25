import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { ShoppingCategory, ShoppingItem } from "@/mocks/shoppingListMock";
import { categorizeIngredients, IngredientInput } from "@/lib/shoppingHelpers";

interface ShoppingBagProps {
  ingredients: IngredientInput[];
  onItemToggle?: (categoryIndex: number, itemId: string) => void;
}

const ShoppingBag = ({ ingredients, onItemToggle }: ShoppingBagProps) => {
  const [categorizedData, setCategorizedData] = useState<ShoppingCategory[]>(
    []
  );

  useEffect(() => {
    const categorized = categorizeIngredients(ingredients);
    setCategorizedData(categorized);
  }, [ingredients]);

  const handleToggle = (categoryIndex: number, itemId: string) => {
    setCategorizedData((prev) => {
      const newData = [...prev];
      const item = newData[categoryIndex].items.find(
        (item) => item.id === itemId
      );
      if (item) {
        item.checked = !item.checked;
      }
      return newData;
    });
    onItemToggle?.(categoryIndex, itemId);
  };

  return (
    <div className="space-y-6">
      {categorizedData.map((category, categoryIndex) => (
        <div
          key={category.category}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <h2
            className={`font-bold text-lg mb-4 ${
              category.color === "orange"
                ? "text-orange-500"
                : "text-yellow-500"
            }`}
          >
            {category.category}
          </h2>
          <div className="space-y-0">
            {category.items.map((item, itemIndex) => (
              <div key={item.id}>
                <div className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => handleToggle(categoryIndex, item.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      item.checked
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {item.checked && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.checked
                        ? "line-through text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-600">{item.amount}</span>
                </div>
                {itemIndex < category.items.length - 1 && (
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
