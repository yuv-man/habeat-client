import { ShoppingItem, ShoppingCategory } from "@/mocks/shoppingListMock";

export interface IngredientInput {
  name: string;
  amount: string; // e.g., "200 g", "2 pcs", "1 large"
}

/**
 * Categorizes an ingredient name into a shopping category
 */
export const categorizeIngredient = (name: string): string => {
  const lowerName = name.toLowerCase();

  // Vegetables
  if (
    lowerName.includes("tomato") ||
    lowerName.includes("cucumber") ||
    lowerName.includes("onion") ||
    lowerName.includes("garlic") ||
    lowerName.includes("pepper") ||
    lowerName.includes("spinach") ||
    lowerName.includes("potato") ||
    lowerName.includes("lettuce") ||
    lowerName.includes("carrot") ||
    lowerName.includes("broccoli") ||
    lowerName.includes("cabbage") ||
    lowerName.includes("celery") ||
    lowerName.includes("zucchini") ||
    lowerName.includes("eggplant") ||
    lowerName.includes("mushroom")
  ) {
    return "Vegetables";
  }

  // Proteins
  if (
    lowerName.includes("chicken") ||
    lowerName.includes("salmon") ||
    lowerName.includes("beef") ||
    lowerName.includes("pork") ||
    lowerName.includes("turkey") ||
    lowerName.includes("egg") ||
    lowerName.includes("tofu") ||
    lowerName.includes("fish") ||
    lowerName.includes("tuna") ||
    lowerName.includes("shrimp") ||
    lowerName.includes("lamb") ||
    lowerName.includes("bacon") ||
    lowerName.includes("sausage")
  ) {
    return "Proteins";
  }

  // Grains & Carbs
  if (
    lowerName.includes("rice") ||
    lowerName.includes("quinoa") ||
    lowerName.includes("bread") ||
    lowerName.includes("pasta") ||
    lowerName.includes("oats") ||
    lowerName.includes("wheat") ||
    lowerName.includes("barley") ||
    lowerName.includes("noodle") ||
    lowerName.includes("flour") ||
    lowerName.includes("cereal") ||
    lowerName.includes("couscous") ||
    lowerName.includes("bulgur")
  ) {
    return "Grains & Carbs";
  }

  // Fruits & Fats
  if (
    lowerName.includes("avocado") ||
    lowerName.includes("olive oil") ||
    lowerName.includes("coconut") ||
    lowerName.includes("banana") ||
    lowerName.includes("apple") ||
    lowerName.includes("berry") ||
    lowerName.includes("nut") ||
    lowerName.includes("seed") ||
    lowerName.includes("orange") ||
    lowerName.includes("grape") ||
    lowerName.includes("peach") ||
    lowerName.includes("mango") ||
    lowerName.includes("pineapple") ||
    lowerName.includes("butter") ||
    lowerName.includes("oil") ||
    lowerName.includes("almond") ||
    lowerName.includes("walnut") ||
    lowerName.includes("peanut")
  ) {
    return "Fruits & Fats";
  }

  // Dairy
  if (
    lowerName.includes("cheese") ||
    lowerName.includes("yogurt") ||
    lowerName.includes("milk") ||
    lowerName.includes("cream") ||
    lowerName.includes("sour cream") ||
    lowerName.includes("cottage cheese") ||
    lowerName.includes("mozzarella") ||
    lowerName.includes("cheddar")
  ) {
    return "Dairy";
  }

  return "Other";
};

/**
 * Categorizes an array of ingredients into shopping categories
 * First aggregates duplicate ingredients, then categorizes them
 */
export const categorizeIngredients = (
  ingredients: IngredientInput[]
): ShoppingCategory[] => {
  // First, aggregate duplicate ingredients by summing amounts
  const aggregatedIngredients = aggregateIngredients(ingredients);

  // Convert aggregated ingredients to ShoppingItems
  const shoppingItems: ShoppingItem[] = aggregatedIngredients.map(
    (ing, index) => ({
      id: `ingredient_${index}_${ing.name.toLowerCase().replace(/\s+/g, "_")}`,
      name: ing.name.split("_").join(" "), // Convert snake_case to readable
      amount: ing.amount,
      checked: false,
    })
  );

  // Group by category
  const categories: Record<string, ShoppingItem[]> = {};

  shoppingItems.forEach((item) => {
    const category = categorizeIngredient(item.name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  // Define category order and colors
  const categoryOrder = [
    "Vegetables",
    "Proteins",
    "Grains & Carbs",
    "Fruits & Fats",
    "Dairy",
    "Other",
  ];
  const colors: ("orange" | "yellow")[] = [
    "orange",
    "yellow",
    "orange",
    "yellow",
    "orange",
    "yellow",
  ];

  // Convert to array format with colors
  return categoryOrder
    .filter((cat) => categories[cat] && categories[cat].length > 0)
    .map((category, index) => ({
      category,
      items: categories[category],
      color: colors[index % colors.length],
    }));
};

/**
 * Parses an amount string to extract numeric value and unit
 * Examples: "200 g" -> {value: 200, unit: "g"}, "2 pcs" -> {value: 2, unit: "pcs"}
 */
const parseAmount = (
  amount: string
): { value: number; unit: string } | null => {
  if (!amount || amount.trim() === "") return null;

  // Match number (including decimals) followed by optional space and unit
  const match = amount.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].trim() || "";

  return { value, unit };
};

/**
 * Aggregates duplicate ingredients by summing their amounts
 * Checks if ingredient already exists and adds the amounts together
 */
export const aggregateIngredients = (
  ingredients: IngredientInput[]
): IngredientInput[] => {
  const aggregated: Record<
    string,
    { name: string; totalValue: number; unit: string }
  > = {};

  ingredients.forEach((ing) => {
    const key = ing.name.toLowerCase().trim();
    const parsed = parseAmount(ing.amount);

    if (!parsed) {
      // If we can't parse the amount, just keep the first occurrence
      if (!aggregated[key]) {
        aggregated[key] = {
          name: ing.name,
          totalValue: 0,
          unit: ing.amount,
        };
      }
      return;
    }

    if (!aggregated[key]) {
      // First occurrence of this ingredient
      aggregated[key] = {
        name: ing.name,
        totalValue: parsed.value,
        unit: parsed.unit,
      };
    } else {
      // Ingredient already exists - check if units match
      if (aggregated[key].unit === parsed.unit || aggregated[key].unit === "") {
        // Same unit or no unit specified - sum the values
        aggregated[key].totalValue += parsed.value;
        // Update unit if it was empty
        if (aggregated[key].unit === "" && parsed.unit !== "") {
          aggregated[key].unit = parsed.unit;
        }
      } else {
        // Different units - keep both amounts separated
        // For now, we'll sum if possible, otherwise keep as separate entries
        // This could be enhanced to handle unit conversions
        aggregated[key].totalValue += parsed.value;
      }
    }
  });

  // Convert back to IngredientInput format
  return Object.values(aggregated).map((item) => {
    if (item.unit) {
      return {
        name: item.name,
        amount: `${item.totalValue} ${item.unit}`,
      };
    } else {
      // If no unit, just return the value or original amount format
      return {
        name: item.name,
        amount: item.totalValue > 0 ? `${item.totalValue}` : "",
      };
    }
  });
};
