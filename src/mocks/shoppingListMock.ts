import { IngredientInput } from "@/lib/shoppingHelpers";

// Mock ingredients as they would come from weekly plan: [{name, amount, category, done}]
export const mockShoppingIngredients: IngredientInput[] = [
  {
    name: "Fresh Spinach",
    amount: "200 g",
    category: "Vegetables",
    done: false,
  },
  {
    name: "Bell Peppers (red & yellow)",
    amount: "2 pcs",
    category: "Vegetables",
    done: false,
  },
  {
    name: "Sweet Potatoes",
    amount: "1 large",
    category: "Vegetables",
    done: false,
  },
  {
    name: "Salmon Fillets",
    amount: "300 g",
    category: "Proteins",
    done: false,
  },
  { name: "Eggs", amount: "12 pcs", category: "Proteins", done: false },
];
