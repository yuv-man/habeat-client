/**
 * Icon mappings for shopping list ingredient categories
 * Uses lucide-react icons for consistency with the app
 */

import {
  Carrot,
  Beef,
  Apple,
  Milk,
  Wheat,
  Fish,
  Egg,
  UtensilsCrossed,
  LeafyGreen,
  Cherry,
  Grape,
  Banana,
  Cookie,
  Coffee,
  Package,
  ShoppingBag,
  LucideIcon,
} from "lucide-react";

export interface CategoryIconConfig {
  icon: LucideIcon;
  color: string;
}

/**
 * Map of category names to their icons and colors
 */
export const categoryIcons: Record<string, CategoryIconConfig> = {
  // Vegetables
  Vegetables: {
    icon: Carrot,
    color: "text-green-600",
  },
  "Fruits & Vegetables": {
    icon: Apple,
    color: "text-green-600",
  },
  Veggies: {
    icon: Carrot,
    color: "text-green-600",
  },
  Produce: {
    icon: LeafyGreen,
    color: "text-green-600",
  },

  // Fruits
  Fruits: {
    icon: Apple,
    color: "text-red-500",
  },
  Fruit: {
    icon: Apple,
    color: "text-red-500",
  },

  // Proteins
  Proteins: {
    icon: Beef,
    color: "text-red-600",
  },
  Protein: {
    icon: Beef,
    color: "text-red-600",
  },
  Meat: {
    icon: Beef,
    color: "text-red-600",
  },
  "Meat & Poultry": {
    icon: Beef,
    color: "text-red-600",
  },
  Poultry: {
    icon: Beef,
    color: "text-red-600",
  },
  Seafood: {
    icon: Fish,
    color: "text-blue-500",
  },
  Fish: {
    icon: Fish,
    color: "text-blue-500",
  },
  Eggs: {
    icon: Egg,
    color: "text-amber-600",
  },

  // Dairy
  Dairy: {
    icon: Milk,
    color: "text-blue-400",
  },
  "Dairy & Eggs": {
    icon: Milk,
    color: "text-blue-400",
  },

  // Grains & Bakery
  Grains: {
    icon: Wheat,
    color: "text-amber-700",
  },
  Bread: {
    icon: Wheat,
    color: "text-amber-700",
  },
  Bakery: {
    icon: Wheat,
    color: "text-amber-700",
  },
  Cereals: {
    icon: Wheat,
    color: "text-amber-700",
  },

  // Pantry & Spices
  Pantry: {
    icon: Package,
    color: "text-orange-600",
  },
  Spices: {
    icon: UtensilsCrossed,
    color: "text-orange-500",
  },
  Condiments: {
    icon: UtensilsCrossed,
    color: "text-orange-500",
  },
  Seasonings: {
    icon: UtensilsCrossed,
    color: "text-orange-500",
  },

  // Beverages
  Beverages: {
    icon: Coffee,
    color: "text-amber-800",
  },
  Drinks: {
    icon: Coffee,
    color: "text-amber-800",
  },

  // Snacks & Sweets
  Snacks: {
    icon: Cookie,
    color: "text-pink-500",
  },
  Sweets: {
    icon: Cookie,
    color: "text-pink-500",
  },

  // Other/Default
  Other: {
    icon: ShoppingBag,
    color: "text-gray-600",
  },
  Miscellaneous: {
    icon: ShoppingBag,
    color: "text-gray-600",
  },
  General: {
    icon: ShoppingBag,
    color: "text-gray-600",
  },
};

/**
 * Get icon and color for a category
 * Falls back to default if category not found
 */
export function getCategoryIcon(
  category: string
): CategoryIconConfig {
  // Try exact match first
  if (categoryIcons[category]) {
    return categoryIcons[category];
  }

  // Try case-insensitive match
  const lowerCategory = category.toLowerCase();
  const match = Object.keys(categoryIcons).find(
    (key) => key.toLowerCase() === lowerCategory
  );

  if (match) {
    return categoryIcons[match];
  }

  // Try partial match for common patterns
  if (lowerCategory.includes("vegetable") || lowerCategory.includes("veggie")) {
    return categoryIcons.Vegetables;
  }
  if (lowerCategory.includes("fruit")) {
    return categoryIcons.Fruits;
  }
  if (
    lowerCategory.includes("protein") ||
    lowerCategory.includes("meat") ||
    lowerCategory.includes("chicken") ||
    lowerCategory.includes("beef") ||
    lowerCategory.includes("pork")
  ) {
    return categoryIcons.Proteins;
  }
  if (
    lowerCategory.includes("seafood") ||
    lowerCategory.includes("fish") ||
    lowerCategory.includes("salmon") ||
    lowerCategory.includes("tuna")
  ) {
    return categoryIcons.Seafood;
  }
  if (lowerCategory.includes("dairy") || lowerCategory.includes("milk")) {
    return categoryIcons.Dairy;
  }
  if (
    lowerCategory.includes("grain") ||
    lowerCategory.includes("bread") ||
    lowerCategory.includes("cereal")
  ) {
    return categoryIcons.Grains;
  }
  if (
    lowerCategory.includes("spice") ||
    lowerCategory.includes("condiment") ||
    lowerCategory.includes("seasoning")
  ) {
    return categoryIcons.Spices;
  }
  if (lowerCategory.includes("beverage") || lowerCategory.includes("drink")) {
    return categoryIcons.Beverages;
  }
  if (lowerCategory.includes("snack") || lowerCategory.includes("sweet")) {
    return categoryIcons.Snacks;
  }

  // Default fallback
  return categoryIcons.Other;
}
